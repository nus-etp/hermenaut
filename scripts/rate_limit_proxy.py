#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
import threading
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Callable

DEFAULT_PORT = 8791
DEFAULT_MIN_INTERVAL_SECS = 6.5
UPSTREAM_TIMEOUT_SECS = 600
CHUNK_SIZE = 65536
REQUEST_HEADERS_DROPPED = {"host", "content-length", "connection", "accept-encoding", "keep-alive"}
RESPONSE_HEADERS_DROPPED = {"connection", "transfer-encoding", "keep-alive", "content-length"}


class Pacer:
    def __init__(
        self,
        min_interval: float,
        clock: Callable[[], float] = time.monotonic,
        sleep: Callable[[float], None] = time.sleep,
    ) -> None:
        self.min_interval = min_interval
        self.clock = clock
        self.sleep = sleep
        self.next_slot = 0.0
        self.lock = threading.Lock()

    def wait_for_slot(self) -> float:
        with self.lock:
            now = self.clock()
            slot = max(now, self.next_slot)
            self.next_slot = slot + self.min_interval
        wait_seconds = slot - now
        if wait_seconds > 0:
            self.sleep(wait_seconds)
        return wait_seconds


def build_handler(upstream: str, pacer: Pacer) -> type[BaseHTTPRequestHandler]:
    upstream_base = upstream.rstrip("/")

    class RateLimitedRelay(BaseHTTPRequestHandler):
        def do_GET(self) -> None:
            self.relay()

        def do_POST(self) -> None:
            self.relay()

        def relay(self) -> None:
            body_length = int(self.headers.get("Content-Length") or 0)
            body = self.rfile.read(body_length) if body_length else None
            forwarded_headers = {
                name: value
                for name, value in self.headers.items()
                if name.lower() not in REQUEST_HEADERS_DROPPED
            }
            request = urllib.request.Request(
                upstream_base + self.path,
                data=body,
                headers=forwarded_headers,
                method=self.command,
            )
            waited = pacer.wait_for_slot()
            try:
                response = urllib.request.urlopen(request, timeout=UPSTREAM_TIMEOUT_SECS)
            except urllib.error.HTTPError as error:
                response = error
            except (urllib.error.URLError, OSError) as error:
                self.send_relay_error(error)
                return
            status = getattr(response, "status", None) or response.code
            sys.stderr.write(f"rate_limit_proxy: {self.command} {self.path} -> {status} (waited {waited:.1f}s)\n")
            self.close_connection = True
            self.send_response(status)
            for name, value in response.headers.items():
                if name.lower() not in RESPONSE_HEADERS_DROPPED:
                    self.send_header(name, value)
            self.end_headers()
            try:
                self.stream_body(response)
            finally:
                response.close()

        def stream_body(self, response) -> None:
            read_chunk = getattr(response, "read1", None) or response.read
            while True:
                chunk = read_chunk(CHUNK_SIZE)
                if not chunk:
                    break
                self.wfile.write(chunk)
                self.wfile.flush()

        def send_relay_error(self, error: Exception) -> None:
            sys.stderr.write(f"rate_limit_proxy: {self.command} {self.path} -> upstream error {error!r}\n")
            payload = json.dumps({"error": {"message": f"upstream unreachable: {error}"}}).encode()
            self.close_connection = True
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

        def log_message(self, *_args) -> None:
            return

    return RateLimitedRelay


def build_server(upstream: str, port: int, min_interval: float, host: str = "127.0.0.1") -> ThreadingHTTPServer:
    handler = build_handler(upstream, Pacer(min_interval))
    return ThreadingHTTPServer((host, port), handler)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Local relay that spaces upstream requests to respect a rate limit.")
    parser.add_argument("--upstream", required=True)
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--min-interval", type=float, default=DEFAULT_MIN_INTERVAL_SECS)
    args = parser.parse_args(argv)
    server = build_server(args.upstream, args.port, args.min_interval)
    sys.stderr.write(
        f"rate_limit_proxy: 127.0.0.1:{args.port} -> {args.upstream}, min interval {args.min_interval}s\n"
    )
    server.serve_forever()
    return 0


if __name__ == "__main__":
    sys.exit(main())
