import type { Metadata } from 'next'

import { meta } from '~/lib/data'
import { Markdown } from '../_components/markdown'

export const metadata: Metadata = {
  title: 'About & method · hermenaut',
  description:
    'How the hermenaut watchlist, living briefs, daily digests and metrics are produced.',
}

const method = `
hermenaut is a daily company-intelligence pipeline for the NUSX watchlist of ${meta.totalCompanies} Southeast Asian climate and deep-tech companies. An autonomous agent, hermes-agent, runs every day at 13:00 UTC in GitHub Actions and commits dated updates and per-company living briefs. This site is rebuilt from that committed output; nothing is edited by hand.

## How a day's edition is made

1. **Deterministic collection.** Scripts check company feeds and sitemaps, the Startup SG directory, investor portfolio lists, IPOS patent and trademark filings, SEC EDGAR filings, GeBIZ tenders, MAS licences, ATS job boards, GitHub, Hacker News and GDELT. Only sources that changed since the last run go forward.
2. **Layer 1, ingest.** A language model judges which collected items are relevant to a watchlisted company and drops the rest.
3. **Layer 2, agent supplement.** The agent searches more deeply on a small daily queue of companies, starting with open questions left in their briefs.
4. **Layer 3, synthesis.** The day's signals are merged into each company's living brief, with every signal dated and linked to its source.
5. **Layer 4, infographics.** Briefs that gained a genuinely new signal get a fresh infographic. Until one is drawn, the brief has no infographic.

## Where the metrics come from

The metrics are hard public evidence, never estimates: disclosed funding rounds, open roles on public job boards, GitHub stars, Hacker News mentions in the last 30 days, GDELT news mentions, dated brief signals in the last 90 days, company age from the ACRA registration date, Startup SG headcount and stage, investor portfolio listings and MAS licences.

The sheet is ranked by disclosed funding by default. Any column can be the ranking instead, including an optional composite: the mean percentile across funding, open roles, GitHub stars, Hacker News mentions, headcount and investor listings, with a missing metric counted as zero. The composite rewards breadth of public evidence, not climate relevance or quality, so a large consumer company can sit near the top; the sheet says so whenever it is chosen.

## Reading the sheet

- A blank metric means no data. It is shown as missing and always sorts last.
- Hacker News counts for short or common-word company names are mostly namesakes, so they are struck through and left out of the ranking.
- Companies struck off at ACRA are hidden until you include them. Then they are grouped last, stamped, and never ranked.
`

export default function AboutPage() {
  return (
    <article className="pt-8 pb-4 sm:pt-10">
      <h1 className="text-ink mb-5 text-[2rem] leading-tight font-bold text-balance">
        About &amp; method
      </h1>
      <Markdown>{method}</Markdown>
    </article>
  )
}
