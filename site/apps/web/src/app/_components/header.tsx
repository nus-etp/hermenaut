import Link from 'next/link'
import { format, parseISO } from 'date-fns'

import { meta, metricsDataAsOf } from '~/lib/data'
import { PrimaryNav } from './primary-nav'

export function Header() {
  return (
    <header className="border-ink bg-paper sticky top-0 z-30 border-b-[1.5px]">
      <div className="sheet flex h-[52px] items-center gap-4 sm:gap-10">
        <Link
          href="/"
          className="font-hand text-ink shrink-0 pt-1 text-[1.375rem] leading-none sm:text-[1.625rem]"
        >
          hermenaut
        </Link>
        <PrimaryNav />
        <p className="text-ink-2 ml-auto hidden shrink-0 text-[13px] lg:block">
          NUSX watchlist · {meta.totalCompanies} companies
          {metricsDataAsOf && (
            <>
              {' · metrics as of '}
              <time dateTime={metricsDataAsOf}>
                {format(parseISO(metricsDataAsOf), 'd MMM yyyy')}
              </time>
            </>
          )}
        </p>
      </div>
    </header>
  )
}
