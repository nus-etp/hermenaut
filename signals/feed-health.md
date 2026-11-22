# Feed health

_Last checked: 2026-11-22 (UTC)_  
12 dead · 5 empty · 2 stale · 187 sources tracked  (dead = ≥3 consecutive failures; empty = ATS board with zero postings on ≥3 consecutive reads; stale = no new items in >45 days)

Dead **firehose/rss** feeds are auto-recovered each run via the Parallel reader fallback in `collect-candidates.py`; a dead feed below is one even the reader couldn't reach, or a kind (`github_org`/`ats_jobs`) the Markdown fallback doesn't cover. Prune or replace those in `data/feeds.json` / `data/companies.json`.

## Dead feeds

| Feed | Kind | Fails | Last status | Jina-recoverable | Last error | URL |
| --- | --- | --- | --- | --- | --- | --- |
| PharLyfe+ · news | rss | 69 | 404 | True | HTTP 404 | https://pharlyfeplus.com/news-update/f.rss |
| The Edge Singapore | firehose | 37 | 403 | True | HTTP 403 | https://www.theedgesingapore.com/rss.xml |
| The Low Down | firehose | 29 | 403 | True | HTTP 403 | https://thelowdown.momentum.asia/feed/ |
| Flow Coffee · blog | rss | 25 | 404 | True | HTTP 404 | https://www.flowcoffee.sg/blog-feed.xml |
| BEEX · press | html_scrape | 24 | 404 | False | HTTP 404 | https://beex.sg/in-the-press/ |
| https://microtube.tech/feed/ |  | 24 | 404 | False | HTTP 404 | https://microtube.tech/feed/ |
| SilentConvo · blog | html_scrape | 24 | 404 | False | HTTP 404 | https://silentconvo.io/blog |
| Cellivate Technologies · press | html_scrape | 24 | 404 | False | HTTP 404 | https://www.cellivatetech.com/recognition |
| Synectify · news | html_scrape | 24 | -1 | False | <urlopen error [Errno -2] Name or service not known> | https://www.synectify.com/news.html |
| Flexii · blog | rss | 14 | 404 | True | HTTP 404 | https://flexii.net/sg/feed/ |
| lalia · press | html_scrape | 7 | -1 | False | <urlopen error [Errno -3] Temporary failure in name resolution> | https://read.lalia.com.sg/press |
| Vietnam Investment Review | firehose | 4 | -1 | True | <urlopen error _ssl.c:1063: The handshake operation timed out> | https://vir.com.vn/rss_feed/ |

## Empty ATS boards

| Board | Kind | Empty reads | Last status | URL |
| --- | --- | --- | --- | --- |
| Horizon Quantum Computing · careers | ats_jobs/mycareersfuture | 18 | 200 | https://api.mycareersfuture.gov.sg/v2/jobs?uen=201802755E&limit=100 |
| Scholarly · careers | ats_jobs/mycareersfuture | 17 | 200 | https://api.mycareersfuture.gov.sg/v2/jobs?uen=202324923K&limit=100 |
| SINGROW · careers | ats_jobs/mycareersfuture | 13 | 200 | https://api.mycareersfuture.gov.sg/v2/jobs?uen=201927365C&limit=100 |
| pQCee · careers | ats_jobs/mycareersfuture | 6 | 200 | https://api.mycareersfuture.gov.sg/v2/jobs?uen=202228798G&limit=100 |
| Taidii · careers | ats_jobs/jobstreet | 3 | 200 | https://sg.jobstreet.com/api/jobsearch/v5/search?siteKey=SG-Main&advertiserid=60536447&pageSize=100&page=1 |

## Stale feeds

| Feed | Kind | Days since new item | Last change | URL |
| --- | --- | --- | --- | --- |
| https://api.lever.co/v0/postings/patsnap?mode=json |  | 92 | 2026-08-22T13:24:01+00:00 | https://api.lever.co/v0/postings/patsnap?mode=json |
| Carousell · press | rss | 73 | 2026-09-10T00:13:35+00:00 | https://press.carousell.com/feed/ |
