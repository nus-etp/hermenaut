# Feed health

_Last checked: 2026-11-12 (UTC)_  
10 dead · 3 empty · 2 stale · 187 sources tracked  (dead = ≥3 consecutive failures; empty = ATS board with zero postings on ≥3 consecutive reads; stale = no new items in >45 days)

Dead **firehose/rss** feeds are auto-recovered each run via the Parallel reader fallback in `collect-candidates.py`; a dead feed below is one even the reader couldn't reach, or a kind (`github_org`/`ats_jobs`) the Markdown fallback doesn't cover. Prune or replace those in `data/feeds.json` / `data/companies.json`.

## Dead feeds

| Feed | Kind | Fails | Last status | Jina-recoverable | Last error | URL |
| --- | --- | --- | --- | --- | --- | --- |
| PharLyfe+ · news | rss | 59 | 404 | True | HTTP 404 | https://pharlyfeplus.com/news-update/f.rss |
| The Edge Singapore | firehose | 27 | 403 | True | HTTP 403 | https://www.theedgesingapore.com/rss.xml |
| https://microtube.tech/feed/ |  | 24 | 404 | False | HTTP 404 | https://microtube.tech/feed/ |
| The Low Down | firehose | 19 | 403 | True | HTTP 403 | https://thelowdown.momentum.asia/feed/ |
| Flow Coffee · blog | rss | 15 | 404 | True | HTTP 404 | https://www.flowcoffee.sg/blog-feed.xml |
| BEEX · press | html_scrape | 14 | 404 | False | HTTP 404 | https://beex.sg/in-the-press/ |
| SilentConvo · blog | html_scrape | 14 | 404 | False | HTTP 404 | https://silentconvo.io/blog |
| Cellivate Technologies · press | html_scrape | 14 | 404 | False | HTTP 404 | https://www.cellivatetech.com/recognition |
| Synectify · news | html_scrape | 14 | -1 | False | <urlopen error [Errno -2] Name or service not known> | https://www.synectify.com/news.html |
| Flexii · blog | rss | 4 | 404 | True | HTTP 404 | https://flexii.net/sg/feed/ |

## Empty ATS boards

| Board | Kind | Empty reads | Last status | URL |
| --- | --- | --- | --- | --- |
| Horizon Quantum Computing · careers | ats_jobs/mycareersfuture | 8 | 200 | https://api.mycareersfuture.gov.sg/v2/jobs?uen=201802755E&limit=100 |
| Scholarly · careers | ats_jobs/mycareersfuture | 7 | 200 | https://api.mycareersfuture.gov.sg/v2/jobs?uen=202324923K&limit=100 |
| SINGROW · careers | ats_jobs/mycareersfuture | 3 | 200 | https://api.mycareersfuture.gov.sg/v2/jobs?uen=201927365C&limit=100 |

## Stale feeds

| Feed | Kind | Days since new item | Last change | URL |
| --- | --- | --- | --- | --- |
| https://api.lever.co/v0/postings/patsnap?mode=json |  | 82 | 2026-08-22T13:24:01+00:00 | https://api.lever.co/v0/postings/patsnap?mode=json |
| Carousell · press | rss | 63 | 2026-09-10T00:13:35+00:00 | https://press.carousell.com/feed/ |
