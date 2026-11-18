import Link from 'next/link'
import { format } from 'date-fns'
import { BiLinkExternal } from 'react-icons/bi'

import type { Company } from '~/lib/data'
import { getEdition } from '~/lib/data'
import { EditionSignalTape } from './edition-signal-tape'
import { NoData, Stamp, toDate } from './paper'

export function BriefMissing({ company }: { company: Company }) {
  return (
    <div className="flex flex-col gap-8">
      <section className="border-rule flex flex-col gap-3 border-b pb-6">
        <Stamp className="self-start">No brief yet</Stamp>
        <p className="text-ink text-[1.0625rem] leading-[1.6]">
          No living brief yet: the agent writes one once a company has enough
          dated signals. Until then, this page lists what is already on record
          for {company.name}.
        </p>
      </section>
      <LatestSignal company={company} />
    </div>
  )
}

function LatestSignal({ company }: { company: Company }) {
  const signalDate = company.latestSignalDate
  const edition = signalDate ? getEdition(signalDate) : undefined
  const mover = edition?.movers.find((entry) => entry.slug === company.slug)

  return (
    <section aria-labelledby="latest-signal">
      <h2
        id="latest-signal"
        className="border-ink text-ink border-b-[1.5px] pb-1.5 text-[1.375rem] leading-snug font-bold"
      >
        Latest signal
      </h2>
      {!signalDate && (
        <p className="py-3">
          <NoData label="no dated signals yet" className="text-sm" />
        </p>
      )}
      {signalDate && !mover && (
        <p className="text-ink py-3 text-[15px]">
          Dated {format(toDate(signalDate), 'd MMM yyyy')}.
        </p>
      )}
      {signalDate && mover && (
        <>
          <ul>
            {mover.items.map((item, index) => (
              <li
                key={`${item.headline}-${index}`}
                className="border-rule flex flex-col gap-1.5 border-b py-3 sm:flex-row sm:items-baseline sm:gap-4"
              >
                <EditionSignalTape
                  type={item.signalType}
                  className="self-start sm:w-28 sm:shrink-0 sm:text-center"
                />
                <div className="min-w-0 text-[15px] leading-snug">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-ink hover:text-link decoration-rule-strong font-semibold underline underline-offset-[0.2em] hover:decoration-current"
                    >
                      {item.headline}
                    </a>
                  ) : (
                    <span className="text-ink font-semibold">
                      {item.headline}
                    </span>
                  )}
                  {item.sourceLabel && (
                    <span className="text-ink-2 ml-1.5 inline-flex items-center gap-1 text-[13px]">
                      {item.sourceLabel}
                      {item.url && (
                        <BiLinkExternal aria-hidden className="h-3 w-3" />
                      )}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="text-ink-2 mt-3 text-sm">
            From the{' '}
            <Link
              href={`/digests/${signalDate}/`}
              className="text-link hover:text-ink font-semibold underline underline-offset-[0.2em]"
            >
              {format(toDate(signalDate), 'EEE d MMM yyyy')} edition
            </Link>
          </p>
        </>
      )}
    </section>
  )
}
