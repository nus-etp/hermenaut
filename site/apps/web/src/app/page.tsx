import type { Metadata } from 'next'
import { Suspense } from 'react'

import type { DirectoryFilterOptions } from './_components/directory-filters'
import type { DirectoryRow, FilterOption } from './_components/directory-rows'
import type { Company, CompanyMetrics } from '~/lib/data'
import {
  companies,
  latestEdition,
  meta,
  METRIC_STAGES,
  metrics,
  REGIONS,
  SECTOR_TAGS,
  SOURCE_TYPES,
  UNCLASSIFIED_COUNT,
  UNCLASSIFIED_SECTOR,
} from '~/lib/data'
import { sourceTypeLabel } from '~/lib/source-types'
import { CompanyDirectory } from './_components/company-directory'
import {
  DirectoryFilters,
  DirectoryFiltersPlaceholder,
} from './_components/directory-filters'
import { DirectoryListingView } from './_components/directory-listing'
import { DirectoryMovers } from './_components/directory-movers'
import {
  DEFAULT_DIRECTION,
  PAGE_SIZE,
  sortRows,
} from './_components/directory-rows'
import { EditionStrip } from './_components/edition-strip'

export const metadata: Metadata = {
  title: 'Directory · hermenaut',
}

const PRIMARY_SECTOR_COUNT = 7

const metricsBySlug = new Map(metrics.companies.map((row) => [row.slug, row]))

function statusStampOf(acraStatus?: string) {
  if (!acraStatus) return 'Inactive'
  const status = acraStatus.toLowerCase()
  if (status.startsWith('gazetted')) return 'Gazetted'
  if (status.includes('struck off')) return 'Struck off'
  if (status.includes('liquidation')) return 'In liquidation'
  if (status.includes('dissolved')) return 'Dissolved'
  return 'Inactive'
}

function summaryOf(company: Company) {
  return company.description || company.affiliations.join(' · ')
}

function toRow(company: Company, metricsRow?: CompanyMetrics): DirectoryRow {
  const stage = metricsRow?.stage
  const inactive = metricsRow?.inactive ?? false
  return {
    slug: company.slug,
    name: company.name,
    searchText: [company.name, ...company.aliases].join(' ').toLowerCase(),
    summary: summaryOf(company),
    sector: company.sector,
    sectorTags: company.sectorTags,
    country: company.region,
    stage,
    stageRank: stage ? METRIC_STAGES.indexOf(stage) : undefined,
    stageSelfReported: metricsRow?.stageSource === 'startupsg',
    hasBrief: company.hasBrief,
    latestSignalDate: company.latestSignalDate,
    moved: company.movedInLatestEdition,
    sourceTypes: company.sourceTypes,
    inactive,
    statusLabel: inactive ? metricsRow?.acraStatus : undefined,
    statusStamp: inactive ? statusStampOf(metricsRow?.acraStatus) : undefined,
  }
}

const rows = companies.map((company) =>
  toRow(company, metricsBySlug.get(company.slug)),
)

function countOptions(
  values: string[],
  countOf: (value: string) => number,
  labelOf: (value: string) => string = (value) => value,
): FilterOption[] {
  return values
    .map((value) => ({ value, label: labelOf(value), count: countOf(value) }))
    .filter((option) => option.count > 0)
}

function buildFilterOptions(): DirectoryFilterOptions {
  const sectorOptions = SECTOR_TAGS.map(({ tag, count }) => ({
    value: tag,
    label: tag,
    count,
  }))
  const unclassified = {
    value: UNCLASSIFIED_SECTOR,
    label: 'Unclassified',
    count: UNCLASSIFIED_COUNT,
  }
  return {
    primarySectors: [
      ...sectorOptions.slice(0, PRIMARY_SECTOR_COUNT),
      unclassified,
    ],
    moreSectors: sectorOptions.slice(PRIMARY_SECTOR_COUNT),
    countries: countOptions(
      REGIONS,
      (region) => rows.filter((row) => row.country === region).length,
    ),
    stages: countOptions(
      METRIC_STAGES,
      (stage) => rows.filter((row) => row.stage === stage).length,
    ),
    sources: countOptions(
      SOURCE_TYPES,
      (source) => rows.filter((row) => row.sourceTypes.includes(source)).length,
      sourceTypeLabel,
    ),
    statuses: [
      {
        value: 'moved',
        label: 'Moved in this edition',
        count: rows.filter((row) => row.moved).length,
      },
      {
        value: 'brief',
        label: 'Has a living brief',
        count: rows.filter((row) => row.hasBrief).length,
      },
      {
        value: 'hide-struck',
        label: 'Hide struck-off',
        count: rows.filter((row) => row.inactive).length,
      },
    ],
  }
}

const filterOptions = buildFilterOptions()

function ListingFallback({ now }: { now: string }) {
  const sorted = sortRows(rows, 'signal', DEFAULT_DIRECTION.signal)
  return (
    <DirectoryListingView
      rows={sorted.slice(0, PAGE_SIZE)}
      matchCount={sorted.length}
      inactiveMatchCount={sorted.filter((row) => row.inactive).length}
      sort="signal"
      direction={DEFAULT_DIRECTION.signal}
      now={now}
      statusNote="Latest signal first, movers on top · struck-off listed last"
    />
  )
}

export default function HomePage() {
  const edition = latestEdition()
  const now = meta.generatedAt

  return (
    <div className="flex flex-col">
      <h1 className="sr-only">hermenaut company directory</h1>
      <EditionStrip
        edition={edition}
        linkToFull
        showNextLink={false}
        showSignalTypes={false}
        showPositionLabels={false}
        freshnessNow={new Date(now)}
      />
      <div className="grid gap-y-6 pt-4 pb-12 lg:grid-cols-[232px_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-[22px]">
        {edition && (
          <div className="min-w-0 lg:col-start-2 lg:row-start-1">
            <DirectoryMovers edition={edition} now={new Date(now)} />
          </div>
        )}
        <aside
          aria-label="Search and filters"
          className="min-w-0 lg:sticky lg:top-[68px] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:max-h-[calc(100dvh-84px)] lg:self-start lg:overflow-y-auto lg:pr-1"
        >
          <Suspense fallback={<DirectoryFiltersPlaceholder />}>
            <DirectoryFilters options={filterOptions} />
          </Suspense>
        </aside>
        <div className="min-w-0 lg:col-start-2 lg:row-start-2">
          <Suspense fallback={<ListingFallback now={now} />}>
            <CompanyDirectory rows={rows} now={now} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
