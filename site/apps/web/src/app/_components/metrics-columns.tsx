import type { ReactNode } from 'react'
import Link from 'next/link'
import { BiDownArrowAlt, BiUpArrowAlt } from 'react-icons/bi'

import type { CompanyMetrics } from '~/lib/data'
import { cx } from '~/lib/cn'
import { NoData, Stamp } from './paper'

export const SORT_KEYS = [
  'funding',
  'score',
  'name',
  'rounds',
  'latestRound',
  'jobs',
  'stars',
  'hn',
  'signals',
  'age',
  'employees',
  'backers',
] as const
export type SortKey = (typeof SORT_KEYS)[number]
export type Direction = 'asc' | 'desc'
export const DEFAULT_SORT: SortKey = 'funding'

export interface RankedCompany extends CompanyMetrics {
  score: number
  scoreInputs: number
  hnCounted?: number
  moved: boolean
  rank?: number
}

export type MetricsRow = Omit<
  RankedCompany,
  'score' | 'scoreInputs' | 'hnCounted' | 'rank'
>

const SCORE_METRICS: ((company: CompanyMetrics) => number | undefined)[] = [
  (company) => company.fundingUsd,
  (company) => company.jobsOpen,
  (company) => company.githubStars,
  (company) => (company.ambiguousName ? undefined : company.hn30d),
  (company) => company.employeesFloor,
  (company) => company.backers.length,
]

export const SCORE_INPUT_COUNT = SCORE_METRICS.length

function percentileRanks(values: (number | undefined)[]) {
  const present = values
    .map((value, index) => ({ value, index }))
    .filter(
      (entry): entry is { value: number; index: number } =>
        typeof entry.value === 'number' && entry.value > 0,
    )
    .sort((a, b) => a.value - b.value)
  const ranks = new Array<number>(values.length).fill(0)
  const firstPosition = new Map<number, number>()
  const lastPosition = new Map<number, number>()
  present.forEach((entry, position) => {
    if (!firstPosition.has(entry.value))
      firstPosition.set(entry.value, position)
    lastPosition.set(entry.value, position)
  })
  for (const entry of present) {
    const first = firstPosition.get(entry.value) ?? 0
    const last = lastPosition.get(entry.value) ?? first
    ranks[entry.index] = (first + last + 2) / 2 / present.length
  }
  return ranks
}

export function withScores(companies: MetricsRow[]): RankedCompany[] {
  const perMetric = SCORE_METRICS.map((metric) =>
    percentileRanks(companies.map(metric)),
  )
  return companies.map((company, index) => {
    const parts = perMetric.map((ranks) => ranks[index] ?? 0)
    const total = parts.reduce((sum, part) => sum + part, 0)
    return {
      ...company,
      score: Math.round((total / SCORE_METRICS.length) * 1000) / 10,
      scoreInputs: parts.filter((part) => part > 0).length,
      hnCounted: company.ambiguousName ? undefined : company.hn30d,
    }
  })
}

export function formatUsd(value?: number) {
  if (value === undefined) return undefined
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(value >= 1e8 ? 0 : 1)}M`
  if (value >= 1e3) return `$${Math.round(value / 1e3)}K`
  return `$${value}`
}

export function formatCount(value?: number) {
  return value === undefined ? undefined : value.toLocaleString('en-US')
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function formatRoundDate(value?: string) {
  if (!value) return undefined
  const [year, month] = value.split('-')
  const monthName = month ? MONTHS[Number(month) - 1] : undefined
  return monthName ? `${monthName} ${year}` : year
}

export function stageLabel(company: CompanyMetrics) {
  if (!company.stage) return undefined
  return company.stageSource === 'startupsg'
    ? `${company.stage}*`
    : company.stage
}

export function DeltaArrow({ rising }: { rising: boolean }) {
  const Arrow = rising ? BiUpArrowAlt : BiDownArrowAlt
  return (
    <Arrow
      aria-hidden
      className="inline h-3.5 w-3.5 shrink-0 align-[-0.15em]"
    />
  )
}

export function JobsDelta({ delta }: { delta?: number }) {
  if (delta === undefined || delta === 0) return null
  const rising = delta > 0
  return (
    <span
      className={cx(
        'ml-1.5 inline-flex items-center text-xs font-semibold',
        rising ? 'text-sage-ink' : 'text-terra-ink',
      )}
    >
      <span aria-hidden="true" className="inline-flex items-center">
        <DeltaArrow rising={rising} />
        {Math.abs(delta)}
      </span>
      <span className="sr-only">
        , {rising ? 'up' : 'down'} {Math.abs(delta)} in 30 days
      </span>
    </span>
  )
}

export function HnCount({ company }: { company: CompanyMetrics }) {
  if (company.hn30d === undefined) return <NoData />
  if (!company.ambiguousName) return <>{formatCount(company.hn30d)}</>
  return (
    <span className="text-ink-3 decoration-terra-ink line-through decoration-[1.5px]">
      {formatCount(company.hn30d)}
      <span className="sr-only"> (namesake-prone name, not ranked)</span>
    </span>
  )
}

export function CompanyName({ company }: { company: RankedCompany }) {
  return (
    <div className="flex flex-col leading-snug">
      <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <Link
          href={`/c/${company.slug}/`}
          className="text-ink hover:text-link font-semibold hover:underline"
        >
          {company.name}
        </Link>
        {company.inactive && <Stamp>Struck off</Stamp>}
        {company.moved && (
          <span className="sr-only">Moved in the latest edition.</span>
        )}
      </span>
      <span className="text-ink-2 text-xs">
        {[company.country, company.sector].filter(Boolean).join(' · ') ||
          'Country unknown'}
        {company.masLicences.length > 0 &&
          ` · MAS: ${company.masLicences.join(', ')}`}
      </span>
    </div>
  )
}

export function CompositeScore({ company }: { company: RankedCompany }) {
  if (!company.scoreInputs) return <NoData />
  return (
    <span className="whitespace-nowrap">
      <span className="font-semibold">{company.score.toFixed(1)}</span>
      <span className="text-ink-3 ml-1.5 text-xs">
        {company.scoreInputs}/{SCORE_INPUT_COUNT}
        <span className="sr-only"> inputs with data</span>
      </span>
    </span>
  )
}

export interface MetricColumn {
  key: SortKey
  label: string
  shortLabel?: string
  align: 'left' | 'right'
  help: string
  source: string
  sortValue: (company: RankedCompany) => number | string | undefined
  cell: (company: RankedCompany) => ReactNode
  csv: (company: RankedCompany) => string | number | undefined
}

function orNoData(value?: string) {
  return value ?? <NoData />
}

export function buildColumns(signalWindowDays: number): MetricColumn[] {
  return [
    {
      key: 'name',
      label: 'Company',
      align: 'left',
      help: 'Watchlist name, linking to the living brief. Country, sector and any MAS licence sit underneath.',
      source: 'Watchlist (companies.json), MAS FID',
      sortValue: (company) => company.name.toLowerCase(),
      cell: (company) => <CompanyName company={company} />,
      csv: (company) => company.name,
    },
    {
      key: 'score',
      label: 'Composite',
      align: 'right',
      help: `Mean percentile across funding, open roles, GitHub stars, HN mentions, headcount and investor listings. A missing input counts as 0, so breadth of public evidence raises a score; it says nothing about climate relevance. The small figure shows how many of the ${SCORE_INPUT_COUNT} inputs had data.`,
      source: 'Computed on this page from the columns below',
      sortValue: (company) => (company.scoreInputs ? company.score : undefined),
      cell: (company) => <CompositeScore company={company} />,
      csv: (company) => (company.scoreInputs ? company.score : undefined),
    },
    {
      key: 'funding',
      label: 'Funding disclosed',
      shortLabel: 'Funding',
      align: 'right',
      help: 'Sum of the US$ amounts of publicly disclosed funding rounds. Undisclosed amounts are not estimated.',
      source: 'Funding rounds curated in the watchlist',
      sortValue: (company) => company.fundingUsd,
      cell: (company) => orNoData(formatUsd(company.fundingUsd)),
      csv: (company) => company.fundingUsd,
    },
    {
      key: 'rounds',
      label: 'Rounds',
      align: 'right',
      help: 'Number of disclosed funding rounds, with or without an amount.',
      source: 'Funding rounds curated in the watchlist',
      sortValue: (company) => company.fundingRounds || undefined,
      cell: (company) =>
        orNoData(
          company.fundingRounds ? String(company.fundingRounds) : undefined,
        ),
      csv: (company) => company.fundingRounds || undefined,
    },
    {
      key: 'latestRound',
      label: 'Stage · last round',
      shortLabel: 'Stage · round',
      align: 'left',
      help: 'Stage of the latest disclosed round and its date; sorting uses the date. * marks a stage self-reported on Startup SG when no round is disclosed.',
      source: 'Watchlist funding rounds, Startup SG profiles',
      sortValue: (company) => company.latestRoundDate,
      cell: (company) => {
        const stage = stageLabel(company)
        const date = formatRoundDate(company.latestRoundDate)
        if (!stage && !date) return <NoData />
        return (
          <span className="whitespace-nowrap">
            {stage ?? 'Round'}
            {company.stageSource === 'startupsg' && (
              <span className="sr-only"> (self-reported)</span>
            )}
            {date && <span className="text-ink-2 ml-1.5 text-xs">{date}</span>}
          </span>
        )
      },
      csv: (company) => company.latestRoundDate,
    },
    {
      key: 'jobs',
      label: 'Open roles',
      align: 'right',
      help: 'Open postings on the company’s public job board at the latest check, with the change over 30 days, marked rising or falling.',
      source:
        'Job boards: Lever, Ashby, SmartRecruiters, MyCareersFuture, JobStreet and others',
      sortValue: (company) => company.jobsOpen,
      cell: (company) =>
        company.jobsOpen === undefined ? (
          <NoData />
        ) : (
          <span className="whitespace-nowrap">
            {company.jobsOpen}
            <JobsDelta delta={company.jobsDelta30} />
          </span>
        ),
      csv: (company) => company.jobsOpen,
    },
    {
      key: 'stars',
      label: 'GitHub stars',
      shortLabel: 'Stars',
      align: 'right',
      help: 'Total stars across the public repositories of the company’s GitHub account.',
      source: 'GitHub API',
      sortValue: (company) => company.githubStars,
      cell: (company) => orNoData(formatCount(company.githubStars)),
      csv: (company) => company.githubStars,
    },
    {
      key: 'hn',
      label: 'HN 30d',
      align: 'right',
      help: 'Hacker News stories and comments matching the exact company name in the last 30 days. Counts for short or common-word names are struck through and never ranked: they are mostly namesakes.',
      source: 'Hacker News (Algolia search)',
      sortValue: (company) => company.hnCounted,
      cell: (company) => <HnCount company={company} />,
      csv: (company) => company.hn30d,
    },
    {
      key: 'signals',
      label: `Signals ${signalWindowDays}d`,
      align: 'right',
      help: `Dated, sourced signals added to the living brief in the last ${signalWindowDays} days.`,
      source: 'Living briefs (signals/briefs)',
      sortValue: (company) => company.signals90d || undefined,
      cell: (company) =>
        orNoData(company.signals90d ? String(company.signals90d) : undefined),
      csv: (company) => company.signals90d,
    },
    {
      key: 'age',
      label: 'Age (yrs)',
      shortLabel: 'Age',
      align: 'right',
      help: 'Years since the company was registered with ACRA. Foreign companies without a Singapore entity have no age.',
      source: 'ACRA registration date',
      sortValue: (company) => company.ageYears,
      cell: (company) => orNoData(company.ageYears?.toFixed(1)),
      csv: (company) => company.ageYears,
    },
    {
      key: 'employees',
      label: 'Headcount',
      align: 'right',
      help: 'Employee range the company reports on Startup SG; sorting uses the lower bound.',
      source: 'Startup SG profiles (self-reported)',
      sortValue: (company) => company.employeesFloor,
      cell: (company) => orNoData(company.employees),
      csv: (company) => company.employees,
    },
    {
      key: 'backers',
      label: 'Investor lists',
      shortLabel: 'Investors',
      align: 'left',
      help: 'Investor and accelerator portfolio pages that list the company; sorting uses how many.',
      source: 'Investor portfolio pages (data/portfolio-lists)',
      sortValue: (company) => company.backers.length || undefined,
      cell: (company) =>
        company.backers.length ? (
          <span className="text-ink-2 block max-w-56 text-xs/snug whitespace-normal">
            {company.backers.join(' · ')}
          </span>
        ) : (
          <NoData />
        ),
      csv: (company) => company.backers.join('; ') || undefined,
    },
  ]
}

export function defaultDirection(key: SortKey): Direction {
  return key === 'name' ? 'asc' : 'desc'
}

export function compareBy(column: MetricColumn, direction: Direction) {
  const sign = direction === 'asc' ? 1 : -1
  return (a: RankedCompany, b: RankedCompany) => {
    const left = column.sortValue(a)
    const right = column.sortValue(b)
    if (left === undefined && right === undefined)
      return a.name.localeCompare(b.name)
    if (left === undefined) return 1
    if (right === undefined) return -1
    if (left === right) return a.name.localeCompare(b.name)
    return (left < right ? -1 : 1) * sign
  }
}
