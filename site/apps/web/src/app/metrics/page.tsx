import type { Metadata } from 'next'
import { Suspense } from 'react'
import { format } from 'date-fns'

import {
  companies,
  latestEdition,
  METRIC_STAGES,
  metrics,
  metricsDataAsOf,
  SECTOR_TAGS,
  UNCLASSIFIED_SECTOR,
} from '~/lib/data'
import { MetricsTable } from '../_components/metrics-table'
import { toDate } from '../_components/paper'

export const metadata: Metadata = {
  title: 'Metrics · hermenaut',
  description:
    'Hard, public metrics for every watchlist company, sortable and ranked, with the method shown.',
}

const COUNTRIES = [
  ...new Set(
    metrics.companies
      .map((company) => company.country)
      .filter((country): country is string => !!country),
  ),
].sort()

const SECTOR_OPTIONS = [
  ...SECTOR_TAGS.map((entry) => entry.tag),
  UNCLASSIFIED_SECTOR,
]

const movedSlugs = new Set(
  companies
    .filter((company) => company.movedInLatestEdition)
    .map((company) => company.slug),
)

const METRIC_ROWS = metrics.companies.map((company) => ({
  ...company,
  moved: movedSlugs.has(company.slug),
}))

function latestEditionLabel() {
  const edition = latestEdition()
  return edition ? format(toDate(edition.date), 'd MMM yyyy') : undefined
}

export default function MetricsPage() {
  return (
    <div className="pt-5 pb-10 sm:pt-10">
      <Suspense
        fallback={
          <p className="border-rule text-ink-2 border-y py-16 text-center text-sm">
            Loading metrics…
          </p>
        }
      >
        <MetricsTable
          intro={
            <header className="flex flex-col gap-1.5 sm:gap-2">
              <h1 className="text-ink text-[1.75rem] leading-tight font-bold text-balance sm:text-[2rem]">
                Metrics
              </h1>
              <p className="text-ink-2 max-w-[60ch] text-[15px]/snug sm:text-base/relaxed">
                Hard public numbers for every company on the watchlist. Rank by
                any column and read how each figure is collected before you
                trust a rank.
              </p>
            </header>
          }
          companies={METRIC_ROWS}
          countries={COUNTRIES}
          sectors={SECTOR_OPTIONS}
          stages={METRIC_STAGES}
          asOf={metricsDataAsOf ?? metrics.asOf}
          asOfLabel={
            metricsDataAsOf
              ? format(toDate(metricsDataAsOf), 'd MMM yyyy')
              : undefined
          }
          signalWindowDays={metrics.signalWindowDays}
          latestEditionLabel={latestEditionLabel()}
        />
      </Suspense>
    </div>
  )
}
