'use client'

import { useState } from 'react'
import Link from 'next/link'

import type { EditionItem, Mover, SignalType } from '~/lib/data'
import { cx } from '~/lib/cn'
import { isQuietSignalType, QUIET_SIGNAL_TYPES } from '~/lib/site'
import { EditionSignalTape } from './edition-signal-tape'
import { NoData } from './no-data'
import { sheetHeadClassName } from './sheet-table'
import { Tape } from './tape'

const quietTypeHeadings: Partial<Record<SignalType, string>> = {
  Release: 'App and product releases',
  Hiring: 'Open roles',
}

interface EditionMoversProps {
  movers: Mover[]
  signalOrder: SignalType[]
}

interface RankedMover {
  mover: Mover
  items: EditionItem[]
  quietCount: number
  topRank: number
}

interface QuietGroup {
  type: SignalType
  entries: { mover: Mover; items: EditionItem[] }[]
  itemCount: number
}

function sourceLabelOf(item: EditionItem) {
  if (item.sourceLabel) return item.sourceLabel
  if (!item.url) return undefined
  try {
    return new URL(item.url).hostname.replace(/^www\./, '')
  } catch {
    return undefined
  }
}

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

function rankMovers(
  movers: Mover[],
  signalOrder: SignalType[],
  visible: Set<SignalType>,
) {
  const rankOf = (type: SignalType) => signalOrder.indexOf(type)
  const ranked: RankedMover[] = []
  movers.forEach((mover) => {
    const items = mover.items
      .filter(
        (item) =>
          !isQuietSignalType(item.signalType) && visible.has(item.signalType),
      )
      .sort(
        (first, second) => rankOf(first.signalType) - rankOf(second.signalType),
      )
    const topItem = items[0]
    if (!topItem) return
    const quietCount = mover.items.filter(
      (item) =>
        isQuietSignalType(item.signalType) && visible.has(item.signalType),
    ).length
    ranked.push({
      mover,
      items,
      quietCount,
      topRank: rankOf(topItem.signalType),
    })
  })
  return ranked.sort((first, second) => {
    const byType = first.topRank - second.topRank
    return byType !== 0 ? byType : second.items.length - first.items.length
  })
}

function groupQuiet(movers: Mover[], visible: Set<SignalType>) {
  return QUIET_SIGNAL_TYPES.flatMap<QuietGroup>((type) => {
    if (!visible.has(type)) return []
    const entries = movers.flatMap((mover) => {
      const items = mover.items.filter((item) => item.signalType === type)
      return items.length > 0 ? [{ mover, items }] : []
    })
    if (entries.length === 0) return []
    const itemCount = entries.reduce(
      (total, entry) => total + entry.items.length,
      0,
    )
    return [{ type, entries, itemCount }]
  })
}

function typeCountsOf(movers: Mover[], signalOrder: SignalType[]) {
  const counts = new Map<SignalType, number>()
  movers.forEach((mover) =>
    mover.items.forEach((item) =>
      counts.set(item.signalType, (counts.get(item.signalType) ?? 0) + 1),
    ),
  )
  return signalOrder.flatMap((type) => {
    const count = counts.get(type)
    return count ? [{ type, count }] : []
  })
}

function CompanyName({
  mover,
  quiet = false,
}: {
  mover: Mover
  quiet?: boolean
}) {
  const className = cx(
    'text-ink hover:underline inline-flex min-h-11 items-center sm:min-h-0',
    quiet ? 'font-semibold' : 'font-bold',
  )
  if (!mover.slug) return <span className={className}>{mover.name}</span>
  return (
    <Link href={`/c/${mover.slug}/`} className={className}>
      {mover.name}
    </Link>
  )
}

function ItemHeadline({ item }: { item: EditionItem }) {
  if (!item.url) return <>{item.headline}</>
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="text-ink decoration-rule-strong hover:decoration-ink py-1 underline"
    >
      {item.headline}
    </a>
  )
}

function ItemSource({
  source,
  className,
}: {
  source: string
  className?: string
}) {
  return (
    <span className={cx('text-ink-3 text-[0.8125rem]', className)}>
      {source}
    </span>
  )
}

function ItemLine({
  item,
  showType,
}: {
  item: EditionItem
  showType: boolean
}) {
  const source = sourceLabelOf(item)
  if (!showType) {
    return (
      <li className="min-w-0 [overflow-wrap:anywhere]">
        <ItemHeadline item={item} />
        {source && <ItemSource source={source} className="ml-2" />}
      </li>
    )
  }
  return (
    <li className="flex flex-col gap-1 sm:grid sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:items-start sm:gap-x-3 lg:grid-cols-[6.5rem_minmax(0,1fr)_11rem] lg:gap-x-5">
      <span className="sm:pt-0.5">
        <EditionSignalTape type={item.signalType} size="sm" />
      </span>
      <span className="min-w-0 [overflow-wrap:anywhere]">
        <ItemHeadline item={item} />
      </span>
      {source && (
        <ItemSource
          source={source}
          className="min-w-0 truncate sm:col-start-2 lg:col-start-3 lg:pt-0.5"
        />
      )}
    </li>
  )
}

function SignalFilter({
  typeCounts,
  visible,
  onToggle,
  onReset,
}: {
  typeCounts: { type: SignalType; count: number }[]
  visible: Set<SignalType>
  onToggle: (type: SignalType) => void
  onReset: () => void
}) {
  const allVisible = typeCounts.every(({ type }) => visible.has(type))
  return (
    <fieldset className="flex flex-wrap items-center gap-x-1 gap-y-1 pt-1">
      <legend className="text-ink float-left mr-3 text-xs font-bold tracking-[0.08em] uppercase">
        Show signals
      </legend>
      {typeCounts.map(({ type, count }) => (
        <label
          key={type}
          className="text-ink hover:bg-paper-deep inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-sm px-2 text-sm sm:min-h-8"
        >
          <input
            type="checkbox"
            checked={visible.has(type)}
            onChange={() => onToggle(type)}
            className="size-3.5"
          />
          {type}
          <span className="text-ink-3 text-[0.8125rem]">{count}</span>
        </label>
      ))}
      {!allVisible && (
        <button
          type="button"
          onClick={onReset}
          className="text-link hover:text-link-hover inline-flex min-h-11 items-center px-2 text-sm font-semibold underline sm:min-h-8"
        >
          Show all types
        </button>
      )}
    </fieldset>
  )
}

const stackedRowClassName =
  'border-rule border-b max-sm:flex max-sm:flex-col max-sm:gap-1 max-sm:px-3 max-sm:py-2.5'

const stackedCellClassName = 'px-2.5 py-2.5 align-top max-sm:p-0'

function WhatMoved({ ranked }: { ranked: RankedMover[] }) {
  return (
    <table className="w-full border-collapse">
      <thead className="max-sm:sr-only">
        <tr>
          <th scope="col" className={cx(sheetHeadClassName, 'w-[15rem]')}>
            Company
          </th>
          <th scope="col" className={sheetHeadClassName}>
            What changed
          </th>
          <th scope="col" className={cx(sheetHeadClassName, 'w-20 text-right')}>
            Signals
          </th>
        </tr>
      </thead>
      <tbody className="max-sm:block">
        {ranked.map(({ mover, items, quietCount }) => (
          <tr
            key={mover.slug ?? mover.name}
            className={cx('wash', stackedRowClassName)}
          >
            <td className={stackedCellClassName}>
              <CompanyName mover={mover} />
              <div className="text-ink-2 text-[0.8125rem]">
                {mover.sector ?? <NoData label="unclassified" />}
              </div>
            </td>
            <td className={stackedCellClassName}>
              <ul className="flex max-w-[75ch] flex-col gap-1.5 lg:max-w-none">
                {items.map((item, index) => (
                  <ItemLine
                    key={`${item.url ?? item.headline}-${index}`}
                    item={item}
                    showType
                  />
                ))}
              </ul>
              {quietCount > 0 && (
                <p className="text-ink-3 mt-1.5 text-[0.8125rem]">
                  Also {plural(quietCount, 'hiring or release signal')} below
                </p>
              )}
            </td>
            <td
              className={cx(
                stackedCellClassName,
                'text-ink text-right font-semibold max-sm:text-left max-sm:text-[0.8125rem] max-sm:font-normal',
              )}
            >
              {items.length}
              <span className="text-ink-2 sm:hidden">
                {' '}
                {items.length === 1 ? 'signal' : 'signals'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function QuietSection({
  groups,
  open,
  onOpenChange,
}: {
  groups: QuietGroup[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const companyCount = new Set(
    groups.flatMap((group) =>
      group.entries.map((entry) => entry.mover.slug ?? entry.mover.name),
    ),
  ).size
  const summary = groups
    .map((group) =>
      group.type === 'Hiring'
        ? plural(group.itemCount, 'hiring signal')
        : plural(group.itemCount, 'release'),
    )
    .join(' · ')

  return (
    <details
      open={open}
      onToggle={(event) => onOpenChange(event.currentTarget.open)}
      className="group border-rule border-t"
    >
      <summary className="hover:bg-paper-deep/60 flex min-h-11 cursor-pointer list-none flex-wrap items-center gap-x-3.5 gap-y-1 py-2 [&::-webkit-details-marker]:hidden">
        <h2 className="m-0 text-base font-normal">
          <Tape variant="terra">Hiring and releases</Tape>
        </h2>
        <span className="text-ink-2 text-[0.8125rem]">
          {summary} across {plural(companyCount, 'company', 'companies')}
        </span>
        <span className="text-link ml-auto text-sm font-semibold">
          <span className="group-open:hidden">Show</span>
          <span className="hidden group-open:inline">Hide</span>
        </span>
      </summary>
      <div className="flex flex-col gap-5 pt-2 pb-2">
        {groups.map((group) => (
          <section key={group.type} aria-labelledby={`quiet-${group.type}`}>
            <h3
              id={`quiet-${group.type}`}
              className="text-ink-2 border-ink border-b-[1.5px] pb-1 text-[11px] font-bold tracking-[0.07em] uppercase"
            >
              {quietTypeHeadings[group.type] ?? group.type} · {group.itemCount}
            </h3>
            <ul>
              {group.entries.map(({ mover, items }) => (
                <li
                  key={mover.slug ?? mover.name}
                  className="border-rule grid items-start gap-x-5 gap-y-1 border-b py-2 sm:grid-cols-[15rem_1fr]"
                >
                  <CompanyName mover={mover} quiet />
                  <ul className="text-ink-2 flex max-w-[75ch] flex-col gap-1 text-sm">
                    {items.map((item, index) => (
                      <ItemLine
                        key={`${item.url ?? item.headline}-${index}`}
                        item={item}
                        showType={false}
                      />
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </details>
  )
}

export function EditionMovers({ movers, signalOrder }: EditionMoversProps) {
  const typeCounts = typeCountsOf(movers, signalOrder)
  const allTypes = typeCounts.map(({ type }) => type)
  const [visible, setVisible] = useState<Set<SignalType>>(
    () => new Set(allTypes),
  )
  const [quietOpen, setQuietOpen] = useState(false)

  const ranked = rankMovers(movers, signalOrder, visible)
  const quietGroups = groupQuiet(movers, visible)
  const hasSignificantTypes = allTypes.some((type) => !isQuietSignalType(type))

  function updateVisible(next: Set<SignalType>) {
    setVisible(next)
    const onlyQuietLeft = [...next].every((type) => isQuietSignalType(type))
    if (onlyQuietLeft && next.size > 0) setQuietOpen(true)
  }

  function toggleType(type: SignalType) {
    const next = new Set(visible)
    if (next.has(type)) next.delete(type)
    else next.add(type)
    updateVisible(next)
  }

  return (
    <div className="flex flex-col gap-6">
      {typeCounts.length > 1 && (
        <SignalFilter
          typeCounts={typeCounts}
          visible={visible}
          onToggle={toggleType}
          onReset={() => updateVisible(new Set(allTypes))}
        />
      )}

      <section aria-labelledby="what-moved" className="flex flex-col gap-2">
        <div className="flex min-h-[30px] flex-wrap items-center gap-x-3.5 gap-y-1">
          <h2 id="what-moved" className="m-0 text-base font-normal">
            <Tape variant="blue">What moved</Tape>
          </h2>
          <p className="text-ink-2 text-[0.8125rem]">
            Funding, partnerships, patents, tenders, filings, case studies and
            news · ranked by significance · each name opens its living brief
          </p>
        </div>
        {ranked.length > 0 ? (
          <WhatMoved ranked={ranked} />
        ) : (
          <p className="border-rule text-ink-2 border-y py-3 text-sm">
            {hasSignificantTypes
              ? 'No signals of the selected types.'
              : 'Nothing beyond hiring and releases in this edition.'}
          </p>
        )}
      </section>

      {quietGroups.length > 0 && (
        <QuietSection
          groups={quietGroups}
          open={quietOpen}
          onOpenChange={setQuietOpen}
        />
      )}
    </div>
  )
}
