import Link from 'next/link'
import { format } from 'date-fns'
import { BiArrowBack } from 'react-icons/bi'

import type { Company, CompanyMetrics } from '~/lib/data'
import { cx } from '~/lib/cn'
import { NoData, RelativeAge, Tape, toDate, washClassName } from './paper'

interface BriefHeaderProps {
  company: Company
  companyMetrics?: CompanyMetrics
  latestEditionDate?: string
  now: Date
}

export function BriefHeader({
  company,
  companyMetrics,
  latestEditionDate,
  now,
}: BriefHeaderProps) {
  const movedEditionDate = company.movedInLatestEdition
    ? latestEditionDate
    : undefined

  return (
    <header
      className={cx(
        'border-rule -mx-4 border-b px-4 pt-6 pb-6 sm:-mx-8 sm:px-8 sm:pt-8',
        movedEditionDate && washClassName,
      )}
    >
      <Link
        href="/"
        className="text-ink-2 hover:text-ink inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold sm:min-h-0"
      >
        <BiArrowBack aria-hidden className="h-3.5 w-3.5" />
        Directory
      </Link>

      <h1 className="text-ink mt-4 text-[2rem] leading-tight font-bold tracking-[-0.01em] text-balance sm:text-[2.5rem]">
        {company.name}
      </h1>
      {company.aliases.length > 0 && (
        <p className="text-ink-2 mt-1 text-[13px]">
          Also listed as {company.aliases.join(', ')}
        </p>
      )}

      <FreshnessLine
        company={company}
        now={now}
        movedEditionDate={movedEditionDate}
      />

      {company.description && (
        <p className="text-ink mt-4 max-w-[68ch] text-[1.0625rem] leading-[1.55]">
          {company.description}
        </p>
      )}

      <FactsRow company={company} companyMetrics={companyMetrics} />
    </header>
  )
}

function MovedTape({ editionDate }: { editionDate: string }) {
  return (
    <Link
      href={`/digests/${editionDate}/`}
      className="group inline-flex min-h-11 items-center sm:min-h-0"
    >
      <Tape variant="blue" className="group-hover:brightness-95">
        Moved in the {format(toDate(editionDate), 'd MMM')} edition
      </Tape>
    </Link>
  )
}

const freshnessLineClassName =
  'text-ink-2 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px]'

function FreshnessLine({
  company,
  now,
  movedEditionDate,
}: {
  company: Company
  now: Date
  movedEditionDate?: string
}) {
  const movedTape = movedEditionDate && (
    <MovedTape editionDate={movedEditionDate} />
  )
  if (company.lastUpdated) {
    const updatedDay = company.lastUpdated.slice(0, 10)
    const updatedTimeUtc = company.lastUpdated.slice(11, 16)
    return (
      <div className={freshnessLineClassName}>
        <p>
          Updated{' '}
          <time
            dateTime={company.lastUpdated}
            className="text-ink font-semibold"
          >
            {format(toDate(updatedDay), 'd MMM yyyy')}
          </time>
          {updatedTimeUtc && <span>, {updatedTimeUtc} UTC</span>} ·{' '}
          <RelativeAge date={updatedDay} now={now} />
        </p>
        {movedTape}
      </div>
    )
  }
  if (company.latestSignalDate) {
    return (
      <div className={freshnessLineClassName}>
        <p>
          Latest signal{' '}
          <span className="text-ink font-semibold">
            {format(toDate(company.latestSignalDate), 'd MMM yyyy')}
          </span>{' '}
          · <RelativeAge date={company.latestSignalDate} now={now} />
        </p>
        {movedTape}
      </div>
    )
  }
  return (
    <div className={freshnessLineClassName}>
      <p>
        <NoData label="no dated signals yet" className="text-[15px]" />
      </p>
      {movedTape}
    </div>
  )
}

function FactsRow({
  company,
  companyMetrics,
}: {
  company: Company
  companyMetrics?: CompanyMetrics
}) {
  const stage = companyMetrics?.stage ?? company.latestFundingStage
  const isSelfReportedStage =
    companyMetrics?.stage !== undefined &&
    companyMetrics.stageSource === 'startupsg'

  return (
    <dl className="border-rule mt-5 flex flex-wrap gap-x-10 gap-y-3 border-t pt-4">
      <Fact label="Sector">
        {company.sectorTags.length > 0 ? (
          company.sectorTags.join(' · ')
        ) : (
          <NoData label="unclassified" className="text-sm" />
        )}
      </Fact>
      <Fact label="Country">
        {company.regionFull ?? company.region ?? <NoData className="text-sm" />}
      </Fact>
      <Fact label="Stage">
        {stage ? (
          <>
            {stage}
            {isSelfReportedStage && (
              <span
                className="text-ink-2 ml-1 text-xs"
                title="Self-reported on Startup SG"
              >
                * self-reported
              </span>
            )}
          </>
        ) : (
          <NoData className="text-sm" />
        )}
      </Fact>
      <Fact label="Affiliations">
        {company.affiliations.length > 0 ? (
          company.affiliations.join(' · ')
        ) : (
          <NoData label="none on record" className="text-sm" />
        )}
      </Fact>
    </dl>
  )
}

function Fact({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <dt className="text-ink-2 text-[11px] font-bold tracking-[0.08em] uppercase">
        {label}
      </dt>
      <dd className="text-ink mt-0.5 text-[15px]">{children}</dd>
    </div>
  )
}
