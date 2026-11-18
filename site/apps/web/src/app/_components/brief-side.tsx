import Link from 'next/link'
import { format } from 'date-fns'
import { BiLinkExternal } from 'react-icons/bi'

import type { Company, FundingRound, SourceLink } from '~/lib/data'
import { getEdition } from '~/lib/data'
import { sourceTypeLabel } from '~/lib/source-types'
import { NoData, RelativeAge, toDate } from './paper'

const usdFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 2,
})

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function BriefSideHeading({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  return (
    <h2
      id={id}
      className="border-ink text-ink border-b-[1.5px] pb-1.5 text-[0.8125rem] font-bold tracking-[0.08em] uppercase"
    >
      {children}
    </h2>
  )
}

export function BriefRecord({ company, now }: { company: Company; now: Date }) {
  const { website, uen } = company.identifiers
  const signalDate = company.latestSignalDate
  const signalEdition = signalDate ? getEdition(signalDate) : undefined

  return (
    <section aria-labelledby="brief-record">
      <BriefSideHeading id="brief-record">On record</BriefSideHeading>
      <dl className="text-[14px]">
        <RecordRow label="Website">
          {website ? (
            <a
              href={website}
              target="_blank"
              rel="noreferrer noopener"
              className="text-link hover:text-ink break-all underline underline-offset-[0.2em]"
            >
              {hostOf(website)}
            </a>
          ) : (
            <NoData />
          )}
        </RecordRow>
        <RecordRow label="UEN">{uen ?? <NoData />}</RecordRow>
        <RecordRow label="Latest signal">
          {signalDate ? (
            <span>
              {signalEdition ? (
                <Link
                  href={`/digests/${signalDate}/`}
                  className="text-link hover:text-ink underline underline-offset-[0.2em]"
                >
                  {format(toDate(signalDate), 'd MMM yyyy')}
                </Link>
              ) : (
                format(toDate(signalDate), 'd MMM yyyy')
              )}
              <span className="text-ink-2">
                {' '}
                · <RelativeAge date={signalDate} now={now} />
              </span>
            </span>
          ) : (
            <NoData />
          )}
        </RecordRow>
        <RecordRow label="Last funding">
          {company.latestFundingStage ? (
            <span>
              {company.latestFundingStage}
              {company.latestFundingDate && (
                <span className="text-ink-2">
                  {' '}
                  · {company.latestFundingDate}
                </span>
              )}
            </span>
          ) : (
            <NoData />
          )}
        </RecordRow>
      </dl>
    </section>
  )
}

function RecordRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="border-rule grid grid-cols-[7rem_minmax(0,1fr)] gap-3 border-b py-2">
      <dt className="text-ink-2">{label}</dt>
      <dd className="text-ink min-w-0">{children}</dd>
    </div>
  )
}

function investorsOf(round: FundingRound) {
  const leads = round.lead_investors ?? []
  const others = (round.investors ?? []).filter(
    (investor) => !leads.includes(investor),
  )
  return { leads, others }
}

export function BriefFunding({ rounds }: { rounds: FundingRound[] }) {
  const disclosedTotal = rounds.reduce(
    (total, round) => total + (round.amount_usd ?? 0),
    0,
  )

  return (
    <section aria-labelledby="brief-funding">
      <BriefSideHeading id="brief-funding">Funding rounds</BriefSideHeading>
      {rounds.length === 0 ? (
        <p className="border-rule border-b py-2.5">
          <NoData label="no disclosed rounds" className="text-sm" />
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead className="sr-only">
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Round and investors</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((round, index) => {
                const { leads, others } = investorsOf(round)
                return (
                  <tr
                    key={`${round.date ?? 'undated'}-${index}`}
                    className="border-rule border-b align-top"
                  >
                    <td className="text-ink-2 py-2 pr-3 whitespace-nowrap">
                      {round.date ?? <NoData label="undated" />}
                    </td>
                    <td className="py-2 pr-3">
                      <span className="text-ink font-semibold">
                        {round.stage ?? <NoData label="stage unknown" />}
                      </span>
                      {(leads.length > 0 || others.length > 0) && (
                        <span className="text-ink-2 mt-0.5 block text-[13px] leading-snug">
                          {leads.length > 0 && (
                            <span className="text-ink">{leads.join(', ')}</span>
                          )}
                          {leads.length > 0 && others.length > 0 && '; '}
                          {others.join(', ')}
                        </span>
                      )}
                      {round.source && (
                        <a
                          href={round.source}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-link hover:text-ink mt-0.5 inline-block text-[12px] underline underline-offset-[0.2em]"
                        >
                          {hostOf(round.source)}
                        </a>
                      )}
                    </td>
                    <td className="py-2 text-right font-semibold whitespace-nowrap">
                      {round.amount ?? <NoData label="undisclosed" />}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {disclosedTotal > 0 && (
              <tfoot>
                <tr className="border-ink border-t-[1.5px]">
                  <td colSpan={2} className="text-ink-2 py-2">
                    Disclosed total
                  </td>
                  <td className="text-ink py-2 text-right font-bold">
                    {usdFormat.format(disclosedTotal)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </section>
  )
}

export function BriefSources({ sources }: { sources: SourceLink[] }) {
  return (
    <section aria-labelledby="brief-sources">
      <BriefSideHeading id="brief-sources">Tracked sources</BriefSideHeading>
      {sources.length === 0 ? (
        <p className="border-rule border-b py-2.5">
          <NoData label="no company sources tracked" className="text-sm" />
        </p>
      ) : (
        <ul className="text-[14px]">
          {sources.map((source) => (
            <li
              key={source.url}
              className="border-rule grid grid-cols-[7rem_minmax(0,1fr)] gap-3 border-b py-2"
            >
              <span className="text-ink-2">{sourceTypeLabel(source.type)}</span>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group text-ink hover:text-link min-w-0"
              >
                <span className="decoration-rule-strong font-semibold capitalize underline underline-offset-[0.2em] group-hover:decoration-current">
                  {source.label}
                </span>
                <span className="text-ink-2 ml-1.5 inline-flex items-center gap-1 text-[13px] break-all">
                  {hostOf(source.url)}
                  <BiLinkExternal aria-hidden className="h-3 w-3 shrink-0" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
