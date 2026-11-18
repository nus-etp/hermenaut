import type { Metadata } from 'next'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'

import type { Edition, Mover } from '~/lib/data'
import { cx } from '~/lib/cn'
import { allEditions, latestEdition, SIGNAL_TYPES } from '~/lib/data'
import { isQuietSignalType } from '~/lib/site'
import { EditionDate } from '../_components/edition-date'
import { EditionSignalTape } from '../_components/edition-signal-tape'
import { editionHref, EditionStrip } from '../_components/edition-strip'
import { sheetHeadClassName } from '../_components/sheet-table'
import { Tape } from '../_components/tape'

export const metadata: Metadata = {
  title: 'Today · hermenaut',
  description:
    'Every daily edition of the hermenaut watchlist: which companies moved and what kind of signal moved them.',
}

const TOP_MOVER_COUNT = 3

interface MonthGroup {
  key: string
  label: string
  editions: Edition[]
  signalCount: number
}

function groupByMonth(editions: Edition[]) {
  const groups: MonthGroup[] = []
  editions.forEach((edition) => {
    const key = edition.date.slice(0, 7)
    let group = groups.at(-1)
    if (group?.key !== key) {
      group = {
        key,
        label: format(parseISO(edition.date), 'MMMM yyyy'),
        editions: [],
        signalCount: 0,
      }
      groups.push(group)
    }
    group.editions.push(edition)
    group.signalCount += edition.signalCount
  })
  return groups
}

function significantFirst(movers: Mover[]) {
  const isQuiet = (mover: Mover) => isQuietSignalType(mover.signalType)
  return [
    ...movers.filter((mover) => !isQuiet(mover)),
    ...movers.filter(isQuiet),
  ]
}

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

const cellClassName = 'px-2.5 py-0.5 align-middle max-sm:p-0'

function EditionRow({
  edition,
  isLatest,
}: {
  edition: Edition
  isLatest: boolean
}) {
  const typeCounts = SIGNAL_TYPES.flatMap((type) => {
    const count = edition.signalTypeCounts[type]
    return count ? [{ type, count }] : []
  })
  const topMovers = significantFirst(edition.movers).slice(0, TOP_MOVER_COUNT)
  const remaining = edition.movers.length - topMovers.length

  return (
    <tr
      className={cx(
        'border-rule border-b max-sm:flex max-sm:flex-col max-sm:gap-1 max-sm:px-3 max-sm:pt-0.5 max-sm:pb-2.5',
        isLatest && 'wash',
      )}
    >
      <th
        scope="row"
        className={cx(
          cellClassName,
          'text-left font-normal max-sm:flex max-sm:items-center max-sm:justify-between max-sm:gap-3',
        )}
      >
        <Link
          href={editionHref(edition.date)}
          className="text-ink inline-flex min-h-11 items-center gap-2.5 hover:underline"
        >
          <EditionDate
            date={edition.date}
            pattern="EEE d MMM"
            size="sm"
            className="pt-1"
          />
          {isLatest && <Tape variant="blue">Latest</Tape>}
        </Link>
        <span className="text-ink-2 text-[0.8125rem] sm:hidden">
          <b className="text-ink font-semibold">
            {edition.companiesMoved} moved
          </b>{' '}
          · {plural(edition.signalCount, 'signal')}
        </span>
      </th>
      <td
        className={cx(
          cellClassName,
          'text-ink text-right font-semibold max-sm:hidden',
        )}
      >
        {edition.companiesMoved}
      </td>
      <td className={cx(cellClassName, 'text-ink text-right max-sm:hidden')}>
        {edition.signalCount}
      </td>
      <td className={cx(cellClassName, '')}>
        <ul
          aria-label="Signals by type"
          className="flex flex-wrap gap-x-1.5 gap-y-1"
        >
          {typeCounts.map(({ type, count }) => (
            <li key={type}>
              <EditionSignalTape type={type} count={count} size="sm" />
            </li>
          ))}
        </ul>
      </td>
      <td className={cx(cellClassName, 'text-ink-2 text-sm')}>
        {topMovers.map((mover) => mover.name).join(' · ')}
        {remaining > 0 && (
          <span className="text-ink-3"> · +{remaining} more</span>
        )}
      </td>
    </tr>
  )
}

export default function TodayPage() {
  const editions = allEditions()
  const latest = latestEdition()
  const months = groupByMonth(editions)
  const oldest = editions.at(-1)

  return (
    <div className="flex flex-col gap-6 pb-8">
      {latest && <EditionStrip edition={latest} linkToFull />}

      <section aria-labelledby="all-editions" className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
          <h1
            id="all-editions"
            className="text-ink text-2xl leading-tight font-bold"
          >
            All editions
          </h1>
          <p className="text-ink-2 text-[0.8125rem]">
            {plural(editions.length, 'daily edition')}
            {oldest && (
              <> since {format(parseISO(oldest.date), 'd MMM yyyy')}</>
            )}{' '}
            · newest first · days with no signals publish no edition
          </p>
        </div>

        <table className="w-full border-collapse">
          <thead className="max-sm:sr-only">
            <tr>
              <th scope="col" className={cx(sheetHeadClassName, 'w-[12rem]')}>
                Edition
              </th>
              <th
                scope="col"
                className={cx(sheetHeadClassName, 'w-24 text-right')}
              >
                Moved
              </th>
              <th
                scope="col"
                className={cx(sheetHeadClassName, 'w-20 text-right')}
              >
                Signals
              </th>
              <th scope="col" className={cx(sheetHeadClassName, 'w-[34%]')}>
                Signal mix
              </th>
              <th scope="col" className={sheetHeadClassName}>
                Top movers
              </th>
            </tr>
          </thead>
          {months.map((month) => (
            <tbody key={month.key} className="max-sm:block">
              <tr className="max-sm:block">
                <th
                  scope="colgroup"
                  colSpan={5}
                  className="bg-paper-deep/70 text-ink-2 border-rule h-8 border-b px-2.5 text-left text-xs font-semibold tracking-[0.02em] max-sm:block max-sm:px-3 max-sm:py-1.5"
                >
                  <span className="text-ink">{month.label}</span> ·{' '}
                  {plural(month.editions.length, 'edition')} ·{' '}
                  {plural(month.signalCount, 'signal')}
                </th>
              </tr>
              {month.editions.map((edition) => (
                <EditionRow
                  key={edition.date}
                  edition={edition}
                  isLatest={edition.date === latest?.date}
                />
              ))}
            </tbody>
          ))}
        </table>
      </section>
    </div>
  )
}
