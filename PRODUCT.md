# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Founders, investors, partners and the wider ecosystem public browsing Southeast Asia's climate and deep-tech companies. They arrive to look up a specific company, scan what changed across the watchlist, or compare companies by public evidence. The NUSX/ETP team maintains the watchlist but is not the primary audience of the site.

## Product Purpose

hermenaut is a daily company-intelligence pipeline for the NUSX watchlist. hermes-agent runs in GitHub Actions, triages feeds and per-company sources, and commits dated updates and per-company living briefs to `signals/`. The site at https://labs.nusx.edu.sg/hermenaut publishes that output.

Success is three jobs served equally, with none subordinate:

- **Company lookup:** find a company and see its current state (living brief, recent signals, metrics) quickly.
- **Daily scan:** daily digests show what moved across the watchlist.
- **Ranking and comparison:** the metrics dashboard compares and prioritises companies by hard public numbers.

## Positioning

The briefs are kept up to date by an autonomous agent running every day over a curated watchlist of about 513 companies, not edited by hand or refreshed now and then. Every signal comes from a deterministic collection step (feeds, sitemaps, ACRA/Startup SG, IPOS, SEC EDGAR, GeBIZ, MAS FID, ATS, GitHub, HN, GDELT) followed by LLM relevance judgment. The metrics are hard public evidence, never estimates.

## Operating Context

- The pipeline runs on a daily 13:00 UTC cron (`hermes-sync.yml`). The site rebuilds from committed data via `pages.yml`.
- `site/apps/web/scripts/build-data.mjs` bakes `data/companies.json`, `signals/briefs/`, `signals/updates/` and `data/metrics/` into generated JSON at build time.
- Routes: `/` (company directory with sector, region, stage and source-type filters), `/c/[slug]` (living brief), `/digests` and `/digests/[date]` (daily digests), `/metrics` (sortable, filterable metrics table with a composite stack rank).

## Capabilities and Constraints

- **Binding:** the site is a fully static export on GitHub Pages, with no server runtime, API routes or request-time data.
- Next.js app in a pnpm/turbo workspace (`site/`). It currently uses `@opengovsg/oui`, which is incidental and can change.
- A brief embeds `infographic.png` below its `_Last updated:_` line. If Layer 4 hasn't run for that company, the image 404s until the next successful run, so the UI must degrade gracefully.
- A blank metric means no data and always sorts last. HN counts for weak (namesake-prone) company names are shown struck through and excluded from ranking. Struck-off companies are hidden by default.
- Terminology: watchlist, living brief, signal, daily digest, layer (1 ingest, 2 agent supplement, 3 synthesis, 4 infographics).

## Brand Commitments

- Name: **hermenaut**, written lowercase. It joins *Hermes*, the messenger, with *-naut*, the voyager.
- Mascot `docs/assets/hermenaut.svg` exists but is not binding.

## Evidence on Hand

- Real data: about 513 companies (`data/companies.json`), living briefs (`signals/briefs/`), dated updates (`signals/updates/`), metrics series (`data/metrics/`), and per-brief infographics.
- None on hand: testimonials, user counts, press or case studies. Don't fabricate them.

## Product Principles

1. **Evidence over assertion.** Every claim traces back to a dated, sourced signal, and missing data is shown as missing, not filled in.
2. **Freshness is the product.** Make it obvious what changed and when.
3. **Three entry points, equal weight.** Lookup, daily scan and comparison are all first-class, and none is buried under another.
4. **Static and fast.** Everything is computed at build time, so pages load instantly from a CDN.
