import type { RankedCompany } from './metrics-columns'
import { formatCount, formatUsd } from './metrics-columns'

interface MetricsSummaryProps {
  rows: RankedCompany[]
  totalCompanies: number
}

export function MetricsSummary({ rows, totalCompanies }: MetricsSummaryProps) {
  const funded = rows.filter((company) => company.fundingUsd !== undefined)
  const fundingTotal = funded.reduce(
    (sum, company) => sum + (company.fundingUsd ?? 0),
    0,
  )
  const openRoles = rows.reduce(
    (sum, company) => sum + (company.jobsOpen ?? 0),
    0,
  )
  const hiringCount = rows.filter(
    (company) => (company.jobsOpen ?? 0) > 0,
  ).length
  const investorListed = rows.filter(
    (company) => company.backers.length > 0,
  ).length

  const figures = [
    {
      label: 'On the sheet',
      value: String(rows.length),
      detail: `of ${totalCompanies} watchlisted`,
    },
    {
      label: 'Funding disclosed',
      value: formatUsd(fundingTotal) ?? '$0',
      detail: `${funded.length} companies`,
    },
    {
      label: 'Open roles',
      value: formatCount(openRoles) ?? '0',
      detail: `${hiringCount} hiring`,
    },
    {
      label: 'Investor-listed',
      value: String(investorListed),
      detail: 'in tracked portfolios',
    },
  ]

  return (
    <dl className="border-ink border-b-rule grid grid-cols-4 gap-x-3 border-y border-t-[1.5px] sm:gap-x-6">
      {figures.map((figure) => (
        <div
          key={figure.label}
          className="flex min-w-0 flex-col gap-0.5 py-2 sm:py-2.5"
        >
          <dt className="text-ink-2 text-[10px] leading-tight font-bold tracking-[0.06em] uppercase sm:text-[11px] sm:tracking-[0.07em]">
            {figure.label}
          </dt>
          <dd className="text-ink text-base leading-tight font-semibold sm:text-xl">
            {figure.value}
          </dd>
          <dd className="text-ink-3 hidden text-xs sm:block">
            {figure.detail}
          </dd>
        </div>
      ))}
    </dl>
  )
}
