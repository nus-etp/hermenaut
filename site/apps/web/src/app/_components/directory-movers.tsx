import Link from 'next/link'
import { BiUpArrowAlt } from 'react-icons/bi'

import type { Edition, Mover } from '~/lib/data'
import { cx } from '~/lib/cn'
import { EditionSignalTape } from './edition-signal-tape'
import { NoData, RelativeAge, Tape, washClassName } from './paper'
import { sheetCellClassName, sheetHeadClassName } from './sheet-table'

interface DirectoryMoversProps {
  edition: Edition
  now: Date
}

function NewSignals({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <BiUpArrowAlt aria-hidden className="h-4 w-4 shrink-0" />
      {count} new
    </span>
  )
}

function CompanyName({
  mover,
  className,
}: {
  mover: Mover
  className?: string
}) {
  if (!mover.slug) return <span className="font-bold">{mover.name}</span>
  return (
    <Link
      href={`/c/${mover.slug}/`}
      className={cx(
        'text-ink font-bold underline-offset-2 hover:underline',
        className,
      )}
    >
      {mover.name}
    </Link>
  )
}

function SourceLabel({
  mover,
  className,
}: {
  mover: Mover
  className?: string
}) {
  if (!mover.sourceLabel) return <NoData />
  if (!mover.url) return <span>{mover.sourceLabel}</span>
  return (
    <a
      href={mover.url}
      target="_blank"
      rel="noreferrer noopener"
      className={cx(
        'text-ink-2 hover:text-link decoration-rule-strong underline underline-offset-2',
        className,
      )}
    >
      {mover.sourceLabel}
    </a>
  )
}

function SectorLabel({ mover }: { mover: Mover }) {
  return mover.sector ? (
    <span>{mover.sector}</span>
  ) : (
    <NoData label="unclassified" />
  )
}

function MoversTable({ edition, now }: DirectoryMoversProps) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[720px] table-fixed border-collapse">
        <colgroup>
          <col className="w-[200px]" />
          <col className="w-[140px]" />
          <col className="w-[116px]" />
          <col />
          <col className="w-[120px]" />
          <col className="w-[92px]" />
          <col className="w-[56px]" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className={sheetHeadClassName}>
              Company
            </th>
            <th scope="col" className={sheetHeadClassName}>
              Sector
            </th>
            <th scope="col" className={sheetHeadClassName}>
              Signal
            </th>
            <th scope="col" className={sheetHeadClassName}>
              What changed
            </th>
            <th scope="col" className={sheetHeadClassName}>
              Source
            </th>
            <th scope="col" className={cx(sheetHeadClassName, 'text-right')}>
              New signals
            </th>
            <th scope="col" className={cx(sheetHeadClassName, 'text-right')}>
              Age
            </th>
          </tr>
        </thead>
        <tbody>
          {edition.movers.map((mover) => (
            <tr key={mover.slug ?? mover.name} className={washClassName}>
              <td className={sheetCellClassName}>
                <CompanyName mover={mover} />
              </td>
              <td className={sheetCellClassName}>
                <SectorLabel mover={mover} />
              </td>
              <td className={sheetCellClassName}>
                <EditionSignalTape type={mover.signalType} />
              </td>
              <td className={sheetCellClassName} title={mover.headline}>
                {mover.headline}
              </td>
              <td className={cx(sheetCellClassName, 'text-ink-2')}>
                <SourceLabel mover={mover} />
              </td>
              <td
                className={cx(
                  sheetCellClassName,
                  'text-sage-ink text-right font-bold',
                )}
              >
                <NewSignals count={mover.count} />
              </td>
              <td className={cx(sheetCellClassName, 'text-ink-2 text-right')}>
                <RelativeAge date={edition.date} now={now} compact />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MoversList({ edition, now }: DirectoryMoversProps) {
  return (
    <ol className="border-ink border-t-[1.5px] md:hidden">
      {edition.movers.map((mover) => (
        <li
          key={mover.slug ?? mover.name}
          className={cx(
            washClassName,
            'border-rule flex flex-col gap-1 border-b px-1 py-3',
          )}
        >
          <div className="flex min-h-11 items-center gap-3">
            <span className="min-w-0 truncate text-[15px]">
              <CompanyName
                mover={mover}
                className="inline-flex min-h-11 items-center"
              />
            </span>
            <EditionSignalTape type={mover.signalType} />
            <span className="text-sage-ink ml-auto shrink-0 font-bold">
              <NewSignals count={mover.count} />
            </span>
          </div>
          <p className="line-clamp-2">{mover.headline}</p>
          <p className="text-ink-2 flex flex-wrap gap-x-2 text-[13px]">
            <SectorLabel mover={mover} />
            <span aria-hidden>·</span>
            <SourceLabel mover={mover} className="-my-3 inline-block py-3" />
            <span aria-hidden>·</span>
            <RelativeAge date={edition.date} now={now} />
          </p>
        </li>
      ))}
    </ol>
  )
}

export function DirectoryMovers({ edition, now }: DirectoryMoversProps) {
  return (
    <section aria-labelledby="movers-heading" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 sm:min-h-[30px]">
        <h2 id="movers-heading">
          <Tape variant="blue">Today’s movers</Tape>
        </h2>
        <p className="text-ink-2 text-[13px]">
          Each row links to its living brief
        </p>
      </div>
      {edition.movers.length === 0 ? (
        <p className="border-ink text-ink-2 border-t-[1.5px] py-4">
          Nothing on the watchlist moved in this edition.
        </p>
      ) : (
        <>
          <MoversTable edition={edition} now={now} />
          <MoversList edition={edition} now={now} />
        </>
      )}
    </section>
  )
}
