'use client'

import type { RankedCompany } from './metrics-columns'

const CSV_COLUMNS: {
  header: string
  value: (company: RankedCompany) => string | number | undefined
}[] = [
  { header: 'rank', value: (company) => company.rank },
  { header: 'company', value: (company) => company.name },
  { header: 'slug', value: (company) => company.slug },
  { header: 'country', value: (company) => company.country },
  { header: 'sector', value: (company) => company.sector },
  {
    header: 'struck_off',
    value: (company) => (company.inactive ? 'yes' : 'no'),
  },
  {
    header: 'composite',
    value: (company) => (company.scoreInputs ? company.score : undefined),
  },
  { header: 'composite_inputs', value: (company) => company.scoreInputs },
  { header: 'funding_usd', value: (company) => company.fundingUsd },
  {
    header: 'funding_rounds',
    value: (company) => company.fundingRounds || undefined,
  },
  { header: 'stage', value: (company) => company.stage },
  {
    header: 'stage_self_reported',
    value: (company) =>
      company.stage
        ? company.stageSource === 'startupsg'
          ? 'yes'
          : 'no'
        : undefined,
  },
  { header: 'latest_round_date', value: (company) => company.latestRoundDate },
  { header: 'open_roles', value: (company) => company.jobsOpen },
  { header: 'open_roles_change_30d', value: (company) => company.jobsDelta30 },
  { header: 'github_stars', value: (company) => company.githubStars },
  { header: 'hn_30d', value: (company) => company.hn30d },
  {
    header: 'hn_namesake_prone',
    value: (company) => (company.ambiguousName ? 'yes' : 'no'),
  },
  { header: 'signals_90d', value: (company) => company.signals90d },
  { header: 'age_years', value: (company) => company.ageYears },
  { header: 'headcount', value: (company) => company.employees },
  {
    header: 'investor_lists',
    value: (company) => company.backers.join('; ') || undefined,
  },
  {
    header: 'mas_licences',
    value: (company) => company.masLicences.join('; ') || undefined,
  },
]

function escapeCell(value: string | number | undefined) {
  if (value === undefined) return ''
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function toCsv(rows: RankedCompany[]) {
  const header = CSV_COLUMNS.map((column) => column.header).join(',')
  const lines = rows.map((company) =>
    CSV_COLUMNS.map((column) => escapeCell(column.value(company))).join(','),
  )
  return [header, ...lines].join('\n')
}

interface MetricsCsvButtonProps {
  rows: RankedCompany[]
  asOf: string
}

export function MetricsCsvButton({ rows, asOf }: MetricsCsvButtonProps) {
  const download = () => {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `hermenaut-metrics-${asOf}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={download}
      className="text-link hover:text-link-hover text-sm whitespace-nowrap underline"
    >
      Download CSV ({rows.length} rows)
    </button>
  )
}
