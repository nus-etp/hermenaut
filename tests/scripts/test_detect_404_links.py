"""Unit tests for scripts/detect_404_links.py."""

from __future__ import annotations

from urllib import error

import pytest


@pytest.fixture()
def links(scripts_module_loader):
    return scripts_module_loader("detect_404_links")


class FakeResponse:
    def __init__(self, status: int) -> None:
        self.status = status

    def close(self) -> None:
        pass


def opener_for(statuses_by_ua: dict[str, int | None], default: int | None = 200):
    calls = []

    def opener(req, timeout):
        user_agent = req.get_header("User-agent")
        calls.append(user_agent)
        status = statuses_by_ua.get(user_agent, default)
        if status is None:
            raise error.URLError("timed out")
        if status >= 400:
            raise error.HTTPError(req.full_url, status, "err", {}, None)
        return FakeResponse(status)

    opener.calls = calls
    return opener


def test_extract_urls_strips_markdown_and_punctuation(links):
    text = (
        "- **2026-10-01** — Raised — [x.com](https://example.com/a-b?x=1).\n"
        "  https://example.org/path,\n"
        "dup https://example.com/a-b?x=1"
    )
    assert links.extract_urls(text) == ["https://example.com/a-b?x=1", "https://example.org/path"]


def test_404_confirmed_by_browser_is_dead(links):
    opener = opener_for({}, default=404)
    result = links.check_url("https://example.com/gone", opener)
    assert result == {"url": "https://example.com/gone", "status": 404, "verdict": "dead"}
    assert opener.calls == [links.UA_LADDER[0], links.BROWSER_UA]


def test_404_only_to_honest_ua_is_live(links):
    opener = opener_for({links.UA_LADDER[0]: 404}, default=200)
    assert links.check_url("https://example.com/p", opener)["verdict"] == "live"


def test_410_is_dead(links):
    assert links.check_url("https://example.com/p", opener_for({}, default=410))["verdict"] == "dead"


def test_bot_wall_is_unknown_not_dead(links):
    opener = opener_for({}, default=403)
    result = links.check_url("https://example.com/p", opener)
    assert result["verdict"] == "unknown"
    assert len(opener.calls) == len(links.UA_LADDER)


def test_gated_then_ok_is_live(links):
    opener = opener_for({links.UA_LADDER[0]: 403}, default=200)
    assert links.check_url("https://example.com/p", opener)["verdict"] == "live"


@pytest.mark.parametrize("status", [None, 500, 503])
def test_network_and_server_errors_are_unknown(links, status):
    assert links.check_url("https://example.com/p", opener_for({}, default=status))["verdict"] == "unknown"


def test_summarise_counts_verdicts(links):
    results = [{"verdict": "dead"}, {"verdict": "live"}, {"verdict": "live"}, {"verdict": "unknown"}]
    assert links.summarise(results) == {"dead": 1, "unknown": 1, "live": 2}


def test_linkedin_404_is_unknown(links):
    result = links.check_url("https://www.linkedin.com/company/assemblr", opener_for({}, default=404))
    assert result["verdict"] == "unknown"
