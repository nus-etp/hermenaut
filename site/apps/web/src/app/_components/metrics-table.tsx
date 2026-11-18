'use client'

import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { parseAsString, parseAsStringEnum, useQueryState } from 'nuqs'
import {
  BiChevronDown,
  BiChevronUp,
  BiDownArrowAlt,
  BiSearch,
  BiUpArrowAlt,
  BiX,
} from 'react-icons/bi'

import type {
  Direction,
  MetricColumn,
  MetricsRow,
  RankedCompany,
  SortKey,
} from './metrics-columns'
import { cx } from '~/lib/cn'
import { matchesSectorTags } from '~/lib/sectors'
import {
  buildColumns,
  compareBy,
  DEFAULT_SORT,
  defaultDirection,
  SORT_KEYS,
  withScores,
} from './metrics-columns'
import { MetricsCsvButton } from './metrics-csv'
import { columnHelpId, MetricsLegend } from './metrics-legend'
import { MetricsRankList } from './metrics-rank-list'
import { MetricsSummary } from './metrics-summary'
import { Stamp, Tape } from './paper'
import { sheetHeadClassName, struckOffGroupClassName } from './sheet-table'

interface Props {
  intro: ReactNode
  companies: MetricsRow[]
  countries: string[]
  sectors: string[]
  stages: string[]
  asOf: string
  asOfLabel?: string
  signalWindowDays: number
  latestEditionLabel?: string
}

const selectClassName =
  'border-ink bg-field text-ink h-9 min-w-0 rounded-sm border px-2 text-sm focus-visible:outline-offset-1'

export function MetricsTable({
  intro,
  companies,
  countries,
  sectors,
  stages,
  asOf,
  asOfLabel,
  signalWindowDays,
  latestEditionLabel,
}: Props) {
  const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''))
  const [country, setCountry] = useQueryState(
    'country',
    parseAsString.withDefault(''),
  )
  const [sector, setSector] = useQueryState(
    'sector',
    parseAsString.withDefault(''),
  )
  const [stage, setStage] = useQueryState(
    'stage',
    parseAsString.withDefault(''),
  )
  const [showInactive, setShowInactive] = useQueryState(
    'inactive',
    parseAsString.withDefault(''),
  )
  const [sort, setSort] = useQueryState(
    'sort',
    parseAsStringEnum<SortKey>([...SORT_KEYS]).withDefault(DEFAULT_SORT),
  )
  const [direction, setDirection] = useQueryState(
    'dir',
    parseAsStringEnum<Direction>(['asc', 'desc']).withDefault(
      defaultDirection(sort),
    ),
  )
  const [showFullTable, setShowFullTable] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const columns = useMemo(
    () => buildColumns(signalWindowDays),
    [signalWindowDays],
  )
  const activeColumn = columnFor(columns, sort)
  const scored = useMemo(() => withScores(companies), [companies])
  const includeInactive = showInactive === '1'

  const { ranked, struckOff } = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const visible = scored.filter((company) => {
      if (!includeInactive && company.inactive) return false
      if (country && company.country !== country) return false
      if (sector && !matchesSectorTags(company, [sector])) return false
      if (stage && company.stage !== stage) return false
      if (needle.length >= 2 && !company.name.toLowerCase().includes(needle))
        return false
      return true
    })
    const compare = compareBy(activeColumn, direction)
    let rank = 0
    const rankedRows = visible
      .filter((company) => !company.inactive)
      .sort(compare)
      .map((company) => ({
        ...company,
        rank:
          activeColumn.sortValue(company) === undefined ? undefined : ++rank,
      }))
    const struckOffRows = visible
      .filter((company) => company.inactive)
      .sort(compare)
    return { ranked: rankedRows, struckOff: struckOffRows }
  }, [
    scored,
    query,
    country,
    sector,
    stage,
    includeInactive,
    activeColumn,
    direction,
  ])

  const allRows = useMemo(() => [...ranked, ...struckOff], [ranked, struckOff])
  const filtersActive = Boolean(query || country || sector || stage)
  const panelFilterCount = [country, sector, stage, includeInactive].filter(
    Boolean,
  ).length

  const chooseSort = (key: SortKey) => {
    void setSort(key === DEFAULT_SORT ? null : key)
    void setDirection(null)
  }

  const onHeaderSort = (key: SortKey) => {
    if (key === sort) {
      void setDirection(direction === 'asc' ? 'desc' : 'asc')
      return
    }
    chooseSort(key)
  }

  const clearFilters = () => {
    void setQuery(null)
    void setCountry(null)
    void setSector(null)
    void setStage(null)
  }

  const clearPanelFilters = () => {
    void setCountry(null)
    void setSector(null)
    void setStage(null)
    void setShowInactive(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-end">
        {intro}
        <div className="max-md:hidden">
          <MetricsSummary rows={allRows} totalCompanies={companies.length} />
        </div>
      </div>

      <MetricsLegend
        columns={columns}
        latestEditionLabel={latestEditionLabel}
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3 md:items-end">
          <div className="relative min-w-0 flex-1 basis-40 md:basis-56">
            <BiSearch
              aria-hidden="true"
              className="text-ink-2 pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => void setQuery(event.target.value || null)}
              aria-label="Search companies by name"
              placeholder="Search companies"
              className="border-ink bg-field text-ink h-11 w-full rounded-sm border-[1.5px] pr-9 pl-8 text-[15px] md:h-9"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => void setQuery(null)}
                className="text-ink-2 hover:text-ink absolute top-0 right-0 flex h-11 w-11 items-center justify-center md:h-9 md:w-9"
              >
                <BiX aria-hidden="true" className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              aria-expanded={filtersOpen}
              aria-controls="metrics-filter-panel"
              onClick={() => setFiltersOpen((open) => !open)}
              className="border-ink text-ink hover:bg-paper-deep inline-flex min-h-11 items-center gap-2 rounded-sm border-[1.5px] px-4 text-sm font-semibold"
            >
              Filters{panelFilterCount > 0 ? ` (${panelFilterCount})` : ''}
              <BiChevronDown
                aria-hidden="true"
                className={cx(
                  'h-4 w-4 transition-transform',
                  filtersOpen && 'rotate-180',
                )}
              />
            </button>
            {panelFilterCount > 0 && (
              <button
                type="button"
                onClick={clearPanelFilters}
                className="text-link hover:text-link-hover min-h-11 px-1 text-sm font-semibold underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div
            id="metrics-filter-panel"
            className={cx(
              'grid grid-cols-2 gap-3 max-md:basis-full md:contents',
              'max-md:border-ink max-md:bg-field max-md:rounded-sm max-md:border-[1.5px] max-md:p-4 max-md:shadow-md',
              !filtersOpen && 'max-md:hidden',
            )}
          >
            <FilterSelect
              label="Sector"
              value={sector}
              onChange={setSector}
              options={sectors}
              allLabel="All sectors"
            />
            <FilterSelect
              label="Stage"
              value={stage}
              onChange={setStage}
              options={stages}
              allLabel="All stages"
            />
            <FilterSelect
              label="Country"
              value={country}
              onChange={setCountry}
              options={countries}
              allLabel="All countries"
            />
            <label className="text-ink flex min-h-11 cursor-pointer items-center gap-2 self-end text-sm md:min-h-9">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(event) =>
                  void setShowInactive(event.target.checked ? '1' : null)
                }
                className="h-4 w-4"
              />
              Include struck-off
            </label>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="bg-ink text-field col-span-2 min-h-11 rounded-sm px-4 text-sm font-semibold md:hidden"
            >
              Show results
            </button>
          </div>
        </div>

        <div className="border-rule flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3">
          <Tape>Ranking</Tape>
          <p className="text-ink-2 text-sm" aria-live="polite">
            <span className="text-ink font-semibold">{ranked.length}</span>{' '}
            companies
            {struckOff.length > 0 && <> + {struckOff.length} struck off</>}
            {asOfLabel && <> · metrics as of {asOfLabel}</>}
            {filtersActive && (
              <>
                {' · '}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-link hover:text-link-hover underline"
                >
                  Clear filters
                </button>
              </>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <label className="text-ink-2 flex items-center gap-2 text-sm">
              Rank by
              <select
                value={sort}
                onChange={(event) => chooseSort(event.target.value as SortKey)}
                className={selectClassName}
              >
                {columns.map((column) => (
                  <option key={column.key} value={column.key}>
                    {column.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() =>
                void setDirection(direction === 'asc' ? 'desc' : 'asc')
              }
              className="border-ink text-ink hover:bg-paper-deep flex h-9 items-center gap-1 rounded-sm border px-2.5 text-sm"
            >
              {direction === 'asc' ? (
                <BiUpArrowAlt aria-hidden="true" />
              ) : (
                <BiDownArrowAlt aria-hidden="true" />
              )}
              {directionLabel(sort, direction)}
            </button>
            <MetricsCsvButton rows={allRows} asOf={asOf} />
          </div>
        </div>

        {sort === 'score' && (
          <p className="text-terra-ink text-sm">
            Ranked by Composite: it rewards breadth of public evidence, not
            climate relevance, so a large consumer company can sit near the top.
            Compare a single column for a sharper read.
          </p>
        )}
      </div>

      {allRows.length === 0 ? (
        <p className="border-rule text-ink-2 border-y py-8 text-center text-sm">
          No companies match these filters.{' '}
          <button
            type="button"
            onClick={clearFilters}
            className="text-link hover:text-link-hover underline"
          >
            Clear filters
          </button>
        </p>
      ) : (
        <>
          <div className="md:hidden">
            <MetricsRankList rows={allRows} column={activeColumn} />
            <button
              type="button"
              aria-expanded={showFullTable}
              aria-controls="metrics-full-table"
              onClick={() => setShowFullTable((open) => !open)}
              className="text-link hover:text-link-hover mt-4 text-sm font-semibold underline"
            >
              {showFullTable
                ? 'Hide the full table'
                : 'Show the full table (scrolls sideways)'}
            </button>
          </div>
          <div
            id="metrics-full-table"
            className={cx(
              'relative overflow-x-auto md:block',
              showFullTable ? 'block' : 'hidden',
            )}
          >
            <FullTable
              columns={columns}
              ranked={ranked}
              struckOff={struckOff}
              sort={sort}
              direction={direction}
              onSort={onHeaderSort}
            />
          </div>
        </>
      )}

      <div className="md:hidden">
        <MetricsSummary rows={allRows} totalCompanies={companies.length} />
      </div>
    </div>
  )
}

function columnFor(columns: MetricColumn[], key: SortKey): MetricColumn {
  const match =
    columns.find((column) => column.key === key) ??
    columns.find((column) => column.key === DEFAULT_SORT)
  if (!match) throw new Error(`Unknown metrics column ${key}`)
  return match
}

function directionLabel(sort: SortKey, direction: Direction) {
  if (sort === 'name') return direction === 'asc' ? 'A to Z' : 'Z to A'
  if (sort === 'latestRound')
    return direction === 'asc' ? 'Oldest first' : 'Newest first'
  return direction === 'asc' ? 'Lowest first' : 'Highest first'
}

interface FilterSelectProps {
  label: string
  value: string
  onChange: (value: string | null) => unknown
  options: string[]
  allLabel: string
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: FilterSelectProps) {
  return (
    <label className="text-ink-2 flex min-w-0 flex-col gap-1 text-xs font-bold tracking-[0.07em] uppercase">
      {label}
      <select
        value={value}
        onChange={(event) => void onChange(event.target.value || null)}
        className={cx(
          selectClassName,
          'h-11 font-normal tracking-normal normal-case md:h-9 md:max-w-52',
        )}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

interface FullTableProps {
  columns: MetricColumn[]
  ranked: RankedCompany[]
  struckOff: RankedCompany[]
  sort: SortKey
  direction: Direction
  onSort: (key: SortKey) => void
}

function FullTable({
  columns,
  ranked,
  struckOff,
  sort,
  direction,
  onSort,
}: FullTableProps) {
  return (
    <table className="w-full min-w-[1180px] border-collapse text-sm">
      <caption className="sr-only">
        Watchlist companies ranked by{' '}
        {columns.find((column) => column.key === sort)?.label}. Column headers
        sort the table.
      </caption>
      <thead>
        <tr className="[&>th]:shadow-[inset_0_-1.5px_0_var(--color-ink)]">
          <th scope="col" className={cx(sheetHeadClassName, 'w-10 border-b-0')}>
            #
          </th>
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
        {ranked.map((company) => (
          <MetricsRowView
            key={company.slug}
            company={company}
            columns={columns}
          />
        ))}
        {struckOff.length > 0 && (
          <tr>
            <td
              colSpan={columns.length + 1}
              className={struckOffGroupClassName}
            >
              <Stamp className="mr-2.5">Struck off</Stamp>
              Closed or winding up at ACRA · {struckOff.length}{' '}
              {struckOff.length === 1 ? 'company' : 'companies'} · grouped last,
              never ranked
            </td>
          </tr>
        )}
        {struckOff.map((company) => (
          <MetricsRowView
            key={company.slug}
            company={company}
            columns={columns}
          />
        ))}
      </tbody>
    </table>
  )
}

function MetricsRowView({
  company,
  columns,
}: {
  company: RankedCompany
  columns: MetricColumn[]
}) {
  return (
    <tr
      className={cx(
        'hover:bg-paper-deep align-top [&>*]:shadow-[inset_0_-1px_0_var(--color-rule)]',
        company.moved && 'wash',
        company.inactive && 'text-ink-3',
      )}
    >
      <td className="text-ink-3 px-2.5 py-1.5 text-xs">
        {company.rank ?? <span className="sr-only">Not ranked</span>}
      </td>
      {columns.map((column) =>
        column.key === 'name' ? (
          <th
            key={column.key}
            scope="row"
            className={cx(
              'bg-paper sticky left-0 min-w-52 px-2.5 py-1.5 text-left font-normal',
              company.moved && 'wash',
            )}
          >
            {column.cell(company)}
          </th>
        ) : (
          <td
            key={column.key}
            className={cx(
              'px-2.5 py-1.5 whitespace-nowrap',
              column.align === 'right' ? 'text-right' : 'text-left',
            )}
          >
            {column.cell(company)}
          </td>
        ),
      )}
    </tr>
  )
}

interface SortHeaderProps {
  column: MetricColumn
  sort: SortKey
  direction: Direction
  onSort: (key: SortKey) => void
}

function SortHeader({ column, sort, direction, onSort }: SortHeaderProps) {
  const active = sort === column.key
  const Arrow = direction === 'asc' ? BiChevronUp : BiChevronDown
  return (
    <th
      scope="col"
      aria-sort={
        active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'
      }
      className={cx(
        sheetHeadClassName,
        'border-b-0 align-bottom',
        column.key === 'name' && 'bg-paper sticky left-0',
        column.align === 'right' ? 'text-right' : 'text-left',
      )}
    >
      <button
        type="button"
        onClick={() => onSort(column.key)}
        aria-describedby={columnHelpId(column)}
        className={cx(
          'hover:text-ink inline-flex h-7 items-center gap-0.5 uppercase',
          active
            ? 'text-ink decoration-ink underline decoration-[1.5px] underline-offset-4'
            : 'text-ink-2',
        )}
      >
        {column.shortLabel ?? column.label}
        {active ? (
          <Arrow aria-hidden="true" className="h-3.5 w-3.5" />
        ) : (
          <span aria-hidden="true" className="w-3.5" />
        )}
      </button>
    </th>
  )
}
