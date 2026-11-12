#!/usr/bin/env python3
"""Report cited URLs that answer 404 Not Found or 410 Gone.

Scans the URLs Layer 2 and Layer 3 cite in this run: every URL in
signals/agent/<date>.md, plus URLs on lines added to signals/briefs/*/LIVING_BRIEF.md
relative to HEAD (whole file for an untracked brief). `--all-briefs` scans every
brief instead, for a one-off audit.

Only 404/410 count as dead. From a GitHub Actions datacentre IP a 401/403/429/503,
a challenge page, a timeout or a TLS error says more about the bot wall than the
page, so those are reported as `unknown` and never as dead. A 404 to the honest
User-Agent is re-checked with a browser User-Agent before it is believed. LinkedIn answers logged-out clients with 404/999
for pages that exist, so its 404s are reported as `unknown` too.

Report-only: prints one line per dead URL and writes data/dead-links.json
(gitignored). Always exits 0.

Usage:
  python3 scripts/detect_404_links.py [--date YYYY-MM-DD] [--all-briefs] [--workers 8]
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable
from urllib import error, request
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))
from user_agents import GATED_STATUSES, build_ladder  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parent.parent
AGENT_DIR = REPO_ROOT / "signals" / "agent"
BRIEFS_DIR = REPO_ROOT / "signals" / "briefs"
OUT_JSON = REPO_ROOT / "data" / "dead-links.json"

UA_LADDER = build_ladder("link-check")
BROWSER_UA = UA_LADDER[1]
DEAD_STATUSES = {404, 410}
UNTRUSTED_404_HOSTS = ("linkedin.com",)
TIMEOUT_SECS = 15
DEFAULT_WORKERS = 8

URL_RE = re.compile(r"https?://[^\s<>()\[\]\"'`]+")
TRAILING_PUNCTUATION = ".,;:!?*_"

Opener = Callable[..., object]


def extract_urls(text: str) -> list[str]:
    urls = []
    for match in URL_RE.finditer(text):
        url = match.group(0).rstrip(TRAILING_PUNCTUATION)
        if url not in urls:
            urls.append(url)
    return urls


def added_brief_text(repo_root: Path = REPO_ROOT) -> str:
    briefs = repo_root / "signals" / "briefs"
    diff = subprocess.run(
        ["git", "-C", str(repo_root), "diff", "-U0", "HEAD", "--", str(briefs)],
        capture_output=True, text=True, check=False,
    ).stdout
    added = [line[1:] for line in diff.splitlines() if line.startswith("+") and not line.startswith("+++")]
    untracked = subprocess.run(
        ["git", "-C", str(repo_root), "ls-files", "--others", "--exclude-standard", "--", str(briefs)],
        capture_output=True, text=True, check=False,
    ).stdout
    for relative in untracked.splitlines():
        if relative.endswith("LIVING_BRIEF.md"):
            added.append((repo_root / relative).read_text(encoding="utf-8", errors="replace"))
    return "\n".join(added)


def all_brief_text(briefs_dir: Path = BRIEFS_DIR) -> str:
    return "\n".join(
        path.read_text(encoding="utf-8", errors="replace")
        for path in sorted(briefs_dir.glob("*/LIVING_BRIEF.md"))
    )


def _status(url: str, user_agent: str, opener: Opener) -> int | None:
    req = request.Request(url, headers={"User-Agent": user_agent, "Accept": "text/html,*/*"}, method="GET")
    try:
        response = opener(req, timeout=TIMEOUT_SECS)
        status = getattr(response, "status", 200)
        close = getattr(response, "close", None)
        if close:
            close()
        return status
    except error.HTTPError as exc:
        return exc.code
    except (error.URLError, TimeoutError, OSError, ValueError):
        return None


def untrusted_404_host(url: str) -> bool:
    host = (urlparse(url).hostname or "").lower()
    return any(host == domain or host.endswith(f".{domain}") for domain in UNTRUSTED_404_HOSTS)


def check_url(url: str, opener: Opener = request.urlopen) -> dict:
    status = None
    last_user_agent = UA_LADDER[0]
    for last_user_agent in UA_LADDER:
        status = _status(url, last_user_agent, opener)
        if status not in GATED_STATUSES:
            break
    if status in DEAD_STATUSES and last_user_agent != BROWSER_UA:
        status = _status(url, BROWSER_UA, opener)
    if status in DEAD_STATUSES and not untrusted_404_host(url):
        verdict = "dead"
    elif status is not None and 200 <= status < 400:
        verdict = "live"
    else:
        verdict = "unknown"
    return {"url": url, "status": status, "verdict": verdict}


def check_all(urls: list[str], workers: int, opener: Opener = request.urlopen) -> list[dict]:
    with ThreadPoolExecutor(max_workers=max(1, workers)) as pool:
        return list(pool.map(lambda url: check_url(url, opener), urls))


def summarise(results: list[dict]) -> dict[str, int]:
    counts = {"dead": 0, "unknown": 0, "live": 0}
    for result in results:
        counts[result["verdict"]] += 1
    return counts


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--date", default=os.environ.get("RUN_DATE") or datetime.now(timezone.utc).strftime("%Y-%m-%d"))
    parser.add_argument("--all-briefs", action="store_true")
    parser.add_argument("--workers", type=int, default=DEFAULT_WORKERS)
    parser.add_argument("--out", type=Path, default=OUT_JSON)
    args = parser.parse_args(argv)

    texts = []
    agent_file = AGENT_DIR / f"{args.date}.md"
    if agent_file.exists():
        texts.append(agent_file.read_text(encoding="utf-8", errors="replace"))
    try:
        texts.append(all_brief_text() if args.all_briefs else added_brief_text())
    except OSError as exc:
        print(f"detect_404_links: could not read briefs: {exc}", file=sys.stderr)

    urls = extract_urls("\n".join(texts))
    results = check_all(urls, args.workers)
    counts = summarise(results)

    for result in results:
        if result["verdict"] == "dead":
            print(f"DEAD {result['status']} {result['url']}")
    print(f"detect_404_links: {len(urls)} URLs checked; dead {counts['dead']}, unknown {counts['unknown']}, live {counts['live']}")

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps({"date": args.date, "counts": counts, "results": results}, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
