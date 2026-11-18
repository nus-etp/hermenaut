'use client'

import { useState } from 'react'
import Link from 'next/link'

import type { MetricColumn, RankedCompany } from './metrics-columns'
import { cx } from '~/lib/cn'
import { Stamp } from './paper'

const PAGE_SIZE = 50

interface MetricsRankListProps {
  rows: RankedCompany[]
  column: MetricColumn
}

export function MetricsRankList({ rows, column }: MetricsRankListProps) {
  const [limit, setLimit] = useState(PAGE_SIZE)
  const visible = rows.slice(0, limit)
  const showsMetric = column.key !== 'name'

  return (
    <div>
      <div className="border-ink text-ink-2 flex border-b-[1.5px] py-1.5 text-[11px] font-bold tracking-[0.07em] uppercase">
        <span className="w-9 shrink-0">#</span>
        <span>Company</span>
        {showsMetric && (
          <span className="ml-auto text-right">{column.label}</span>
        )}
      </div>
      <ol>
        {visible.map((company) => (
          <li
            key={company.slug}
            className={cx(
              'border-rule flex items-start gap-3 border-b py-2.5',
              company.moved && 'wash',
              company.inactive && 'text-ink-3',
            )}
          >
            <span className="text-ink-3 w-6 shrink-0 pt-0.5 text-xs">
              {company.rank ?? <span className="sr-only">Not ranked</span>}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Link
                  href={`/c/${company.slug}/`}
                  className="text-ink font-semibold hover:underline"
                >
                  {company.name}
                </Link>
                {company.inactive && <Stamp>Struck off</Stamp>}
              </span>
              <span className="text-ink-2 text-xs">
                {[company.country, company.sector].filter(Boolean).join(' · ')}
              </span>
            </span>
            {showsMetric && (
              <span className="text-ink max-w-[45%] shrink-0 pt-0.5 text-right text-sm">
                {column.cell(company)}
              </span>
            )}
          </li>
        ))}
      </ol>
      {rows.length > limit && (
        <button
          type="button"
          onClick={() => setLimit(rows.length)}
          className="border-ink text-ink hover:bg-paper-deep mt-3 h-10 w-full rounded-sm border text-sm font-semibold"
        >
          Show all {rows.length} companies
        </button>
      )}
    </div>
  )
}
