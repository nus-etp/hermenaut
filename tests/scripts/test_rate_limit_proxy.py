from __future__ import annotations

import json
import threading
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest


@pytest.fixture()
def rate_limit_proxy(scripts_module_loader):
    return scripts_module_loader("rate_limit_proxy")


class FakeClock:
    def __init__(self) -> None:
        self.now = 100.0
        self.sleeps: list[float] = []

    def clock(self) -> float:
        return self.now

    def sleep(self, seconds: float) -> None:
        self.sleeps.append(seconds)
        self.now += seconds


def test_pacer_spaces_back_to_back_requests(rate_limit_proxy) -> None:
    fake = FakeClock()
    pacer = rate_limit_proxy.Pacer(6.5, clock=fake.clock, sleep=fake.sleep)

    waits = [pacer.wait_for_slot() for _ in range(3)]

    assert waits == [0.0, 6.5, 6.5]
    assert fake.sleeps == [6.5, 6.5]


def test_pacer_does_not_wait_after_idle_gap(rate_limit_proxy) -> None:
    fake = FakeClock()
    pacer = rate_limit_proxy.Pacer(6.5, clock=fake.clock, sleep=fake.sleep)

    pacer.wait_for_slot()
    fake.now += 30
    waited = pacer.wait_for_slot()

    assert waited == 0.0
    assert fake.sleeps == []


class FakeUpstream(BaseHTTPRequestHandler):
    received: list[dict] = []

    def do_POST(self) -> None:
        body = self.rfile.read(int(self.headers["Content-Length"]))
        FakeUpstream.received.append(
            {"path": self.path, "auth": self.headers.get("Authorization"), "body": json.loads(body)}
        )
        if self.path.endswith("/limited"):
            payload = b'{"error":{"message":"rate limited"}}'
            self.send_response(429)
            self.send_header("Retry-After", "7")
        else:
            payload = b'{"choices":[{"message":{"content":"ok"}}]}'
            self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, *_args) -> None:
        return


@pytest.fixture
def relay_url(rate_limit_proxy):
    FakeUpstream.received = []
    upstream = ThreadingHTTPServer(("127.0.0.1", 0), FakeUpstream)
    threading.Thread(target=upstream.serve_forever, daemon=True).start()
    relay = rate_limit_proxy.build_server(f"http://127.0.0.1:{upstream.server_port}", 0, 0.0)
    threading.Thread(target=relay.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{relay.server_port}"
    relay.shutdown()
    relay.server_close()
    upstream.shutdown()
    upstream.server_close()


def post(url: str) -> urllib.request.Request:
    return urllib.request.Request(
        url,
        data=json.dumps({"model": "m"}).encode(),
        headers={"Authorization": "Bearer secret", "Content-Type": "application/json"},
        method="POST",
    )


def test_relay_forwards_request_and_response(relay_url: str) -> None:
    with urllib.request.urlopen(post(relay_url + "/v1/chat/completions"), timeout=5) as response:
        assert response.status == 200
        assert json.loads(response.read())["choices"][0]["message"]["content"] == "ok"

    assert FakeUpstream.received == [
        {"path": "/v1/chat/completions", "auth": "Bearer secret", "body": {"model": "m"}}
    ]


def test_relay_passes_rate_limit_status_and_retry_after(relay_url: str) -> None:
    with pytest.raises(urllib.error.HTTPError) as raised:
        urllib.request.urlopen(post(relay_url + "/v1/limited"), timeout=5)

    with raised.value as error:
        assert error.code == 429
        assert error.headers["Retry-After"] == "7"


def test_relay_returns_502_when_upstream_unreachable(rate_limit_proxy) -> None:
    relay = rate_limit_proxy.build_server("http://127.0.0.1:1", 0, 0.0)
    threading.Thread(target=relay.serve_forever, daemon=True).start()
    try:
        with pytest.raises(urllib.error.HTTPError) as raised:
            urllib.request.urlopen(post(f"http://127.0.0.1:{relay.server_port}/v1/x"), timeout=5)
        with raised.value as error:
            assert error.code == 502
    finally:
        relay.shutdown()
        relay.server_close()
