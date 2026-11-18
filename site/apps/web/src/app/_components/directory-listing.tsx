'use client'

import Link from 'next/link'
import { BiChevronDown, BiChevronUp } from 'react-icons/bi'

import type { DirectoryRow, SortDirection, SortKey } from './directory-rows'
import { cx } from '~/lib/cn'
import { PAGE_SIZE, SORT_KEYS, SORT_LABELS } from './directory-rows'
import { NoData, RelativeAge, Stamp, Tape, washClassName } from './paper'
import {
  sheetCellClassName,
  sheetHeadClassName,
  struckOffGroupClassName,
} from './sheet-table'

export interface DirectoryListingViewProps {
  rows: DirectoryRow[]
  matchCount: number
  inactiveMatchCount: number
  sort: SortKey
  direction: SortDirection
  now: string
  statusNote: string
  onSort?: (key: SortKey) => void
  onShowMore?: () => void
  onShowAll?: () => void
  onReset?: () => void
}

interface Column {
  key: SortKey | 'about'
  label: string
  widthClassName?: string
  alignRight?: boolean
}

const columns: Column[] = [
  { key: 'name', label: 'Company', widthClassName: 'w-[220px]' },
  { key: 'sector', label: 'Sector', widthClassName: 'w-[150px]' },
  { key: 'country', label: 'Country', widthClassName: 'w-[124px]' },
  { key: 'stage', label: 'Stage', widthClassName: 'w-[116px]' },
  { key: 'about', label: 'About' },
  { key: 'brief', label: 'Brief', widthClassName: 'w-[64px]' },
  {
    key: 'signal',
    label: 'Last signal',
    widthClassName: 'w-[100px]',
    alignRight: true,
  },
]

function MovedDot() {
  return (
    <span
      title="Moved in this edition"
      className="bg-wash inline-block h-[7px] w-[7px] shrink-0 rounded-full"
    >
      <span className="sr-only">Moved in this edition</span>
    </span>
  )
}

function RowStamp({ row }: { row: DirectoryRow }) {
  if (!row.statusStamp) return null
  return <Stamp title={row.statusLabel}>{row.statusStamp}</Stamp>
}

function StageLabel({ row }: { row: DirectoryRow }) {
  if (!row.stage) return <NoData />
  return (
    <span
      title={row.stageSelfReported ? 'Self-reported to Startup SG' : undefined}
    >
      {row.stage}
      {row.stageSelfReported && '*'}
    </span>
  )
}

function SignalAge({ row, now }: { row: DirectoryRow; now: Date }) {
  if (!row.latestSignalDate) return <NoData label="none" />
  return <RelativeAge date={row.latestSignalDate} now={now} compact />
}

function SortHeader({
  column,
  sort,
  direction,
  onSort,
}: {
  column: Column
  sort: SortKey
  direction: SortDirection
  onSort?: (key: SortKey) => void
}) {
  const sortKey = column.key === 'about' ? undefined : column.key
  const isActive = sortKey === sort
  const ariaSort = isActive
    ? direction === 'asc'
      ? 'ascending'
      : 'descending'
    : undefined
  const SortIcon = direction === 'asc' ? BiChevronUp : BiChevronDown
  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={cx(sheetHeadClassName, column.alignRight && 'text-right')}
    >
      {sortKey ? (
        <button
          type="button"
          onClick={() => onSort?.(sortKey)}
          className={cx(
            'hover:text-ink inline-flex h-7 items-center gap-0.5 uppercase',
            isActive &&
              'text-ink decoration-ink underline decoration-[1.5px] underline-offset-4',
          )}
        >
          {column.label}
          {isActive && <SortIcon aria-hidden className="h-3.5 w-3.5" />}
        </button>
      ) : (
        column.label
      )}
    </th>
  )
}

function GroupRow({ count, colSpan }: { count: number; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className={struckOffGroupClassName}>
        <Stamp className="mr-2.5">Struck off</Stamp>
        Closed or winding up at ACRA · {count}{' '}
        {count === 1 ? 'company' : 'companies'} · kept on the sheet, listed last
      </td>
    </tr>
  )
}

function ListingTable({
  rows,
  inactiveMatchCount,
  sort,
  direction,
  now,
  onSort,
}: DirectoryListingViewProps) {
  const nowDate = new Date(now)
  const firstInactiveSlug = rows.find((row) => row.inactive)?.slug
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[860px] table-fixed border-collapse">
        <caption className="sr-only">
          Watchlist companies, sorted by {SORT_LABELS[sort].toLowerCase()}
        </caption>
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} className={column.widthClassName} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((column) => (
              <SortHeader
                key={column.key}
                column={column}
                sort={sort}
                direction={direction}
                onSort={onSort}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <ListingTableRow
              key={row.slug}
              row={row}
              now={nowDate}
              groupStart={
                row.slug === firstInactiveSlug ? inactiveMatchCount : undefined
              }
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ListingTableRow({
  row,
  now,
  groupStart,
}: {
  row: DirectoryRow
  now: Date
  groupStart?: number
}) {
  return (
    <>
      {groupStart !== undefined && (
        <GroupRow count={groupStart} colSpan={columns.length} />
      )}
      <tr
        className={cx(
          row.moved && washClassName,
          row.inactive && 'text-ink-3',
          !row.moved && 'hover:bg-paper-deep',
        )}
      >
        <td className={sheetCellClassName}>
          <span className="flex min-w-0 items-center gap-2">
            <Link
              href={`/c/${row.slug}/`}
              title={row.name}
              className={cx(
                'truncate font-bold underline-offset-2 hover:underline',
                row.inactive
                  ? 'text-ink-3 decoration-rule-strong line-through'
                  : 'text-ink',
              )}
            >
              {row.name}
            </Link>
            {row.moved && <MovedDot />}
            <RowStamp row={row} />
          </span>
        </td>
        <td className={sheetCellClassName} title={row.sector}>
          {row.sector ?? <NoData label="unclassified" />}
        </td>
        <td className={sheetCellClassName}>{row.country ?? <NoData />}</td>
        <td className={sheetCellClassName}>
          <StageLabel row={row} />
        </td>
        <td
          className={cx(sheetCellClassName, 'text-ink-2')}
          title={row.summary || undefined}
        >
          {row.summary}
        </td>
        <td className={sheetCellClassName}>
          {row.hasBrief ? (
            <Link
              href={`/c/${row.slug}/`}
              className="text-link hover:text-link-hover font-semibold underline underline-offset-2"
            >
              Yes<span className="sr-only">, read {row.name} brief</span>
            </Link>
          ) : (
            <span className="text-ink-3">No</span>
          )}
        </td>
        <td className={cx(sheetCellClassName, 'text-ink-2 text-right')}>
          <SignalAge row={row} now={now} />
        </td>
      </tr>
    </>
  )
}

function stackedMeta(row: DirectoryRow) {
  return [row.sector ?? 'Unclassified', row.country, row.stage]
    .filter(Boolean)
    .join(' · ')
}

function ListingStack({
  rows,
  inactiveMatchCount,
  now,
}: DirectoryListingViewProps) {
  const nowDate = new Date(now)
  const firstInactiveSlug = rows.find((row) => row.inactive)?.slug
  return (
    <ol className="border-ink border-t-[1.5px] md:hidden">
      {rows.map((row) => (
        <li key={row.slug}>
          {row.slug === firstInactiveSlug && (
            <p className="border-rule bg-terra/[0.07] text-ink-2 flex items-center gap-2.5 border-b px-1 py-2.5 text-xs">
              <Stamp>Struck off</Stamp>
              {inactiveMatchCount} closed or winding up · listed last
            </p>
          )}
          <Link
            href={`/c/${row.slug}/`}
            className={cx(
              'border-rule flex min-h-11 flex-col gap-0.5 border-b px-1 py-2.5',
              row.moved && washClassName,
              row.inactive && 'text-ink-3',
            )}
          >
            <span className="flex items-center gap-2">
              <span
                className={cx(
                  'min-w-0 truncate text-[15px] font-bold',
                  row.inactive && 'line-through',
                )}
              >
                {row.name}
              </span>
              {row.moved && <MovedDot />}
              <RowStamp row={row} />
              <span className="text-ink-2 ml-auto shrink-0 pl-2 text-[13px]">
                <SignalAge row={row} now={nowDate} />
              </span>
            </span>
            <span className="text-ink-2 truncate text-[13px]">
              {stackedMeta(row)}
              {row.hasBrief && ' · Brief'}
            </span>
            {row.summary && (
              <span className="text-ink-3 truncate text-[13px]">
                {row.summary}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ol>
  )
}

function EmptyListing({ onReset }: { onReset?: () => void }) {
  return (
    <div className="border-ink flex flex-col items-start gap-3 border-t-[1.5px] py-8">
      <Stamp>No match</Stamp>
      <p className="text-ink text-[15px] font-semibold">
        No company on the watchlist matches these filters.
      </p>
      <p className="text-ink-2">
        Try a shorter search, or drop a sector or country.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="border-ink hover:bg-paper-deep min-h-11 rounded-sm border-[1.5px] px-4 text-sm font-semibold"
      >
        Reset filters
      </button>
    </div>
  )
}

function SortSelect({
  sort,
  onSort,
}: {
  sort: SortKey
  onSort?: (key: SortKey) => void
}) {
  return (
    <label className="text-ink-2 flex items-center gap-2 text-[13px] md:hidden">
      Sort
      <select
        value={sort}
        onChange={(event) => onSort?.(event.target.value as SortKey)}
        className="border-ink bg-field text-ink h-11 rounded-sm border px-2 text-sm"
      >
        {SORT_KEYS.map((key) => (
          <option key={key} value={key}>
            {SORT_LABELS[key]}
          </option>
        ))}
      </select>
    </label>
  )
}

export function DirectoryListingView(props: DirectoryListingViewProps) {
  const {
    rows,
    matchCount,
    sort,
    statusNote,
    onSort,
    onShowMore,
    onShowAll,
    onReset,
  } = props
  const remaining = matchCount - rows.length
  return (
    <section aria-labelledby="listing-heading" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 sm:min-h-[30px]">
        <h2 id="listing-heading">
          <Tape>Full listing</Tape>
        </h2>
        <p className="text-ink-2 text-[13px]" aria-live="polite">
          {statusNote}
        </p>
        <span className="ml-auto">
          <SortSelect sort={sort} onSort={onSort} />
        </span>
      </div>
      {matchCount === 0 ? (
        <EmptyListing onReset={onReset} />
      ) : (
        <>
          <ListingTable {...props} />
          <ListingStack {...props} />
        </>
      )}
      {remaining > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3">
          <button
            type="button"
            onClick={onShowMore}
            className="border-ink hover:bg-paper-deep min-h-11 rounded-sm border-[1.5px] px-4 text-sm font-semibold"
          >
            Show next {Math.min(remaining, PAGE_SIZE)}
          </button>
          <button
            type="button"
            onClick={onShowAll}
            className="text-link hover:text-link-hover min-h-11 px-1 text-sm font-semibold underline"
          >
            Show all {remaining} remaining
          </button>
          <p className="text-ink-3 text-[13px]">{rows.length} listed so far</p>
        </div>
      )}
    </section>
  )
}
