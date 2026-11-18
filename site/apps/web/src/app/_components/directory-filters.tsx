'use client'

import { useState } from 'react'
import { BiChevronDown } from 'react-icons/bi'

import type { FilterOption } from './directory-rows'
import { cx } from '~/lib/cn'
import { useDirectoryQuery } from './directory-query'

export interface DirectoryFilterOptions {
  primarySectors: FilterOption[]
  moreSectors: FilterOption[]
  countries: FilterOption[]
  stages: FilterOption[]
  sources: FilterOption[]
  statuses: FilterOption[]
}

const groupLabelClassName =
  'text-ink text-xs font-bold tracking-[0.08em] uppercase'

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((existing) => existing !== value)
    : [...values, value]
}

function OptionCheckboxes({
  options,
  selected,
  onChange,
}: {
  options: FilterOption[]
  selected: string[]
  onChange: (next: string[]) => void
}) {
  return (
    <ul className="flex flex-col">
      {options.map((option) => (
        <li key={option.value}>
          <label className="hover:bg-paper-deep -mx-1.5 flex min-h-11 cursor-pointer items-center gap-2 rounded-sm px-1.5 text-sm lg:min-h-[26px]">
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => onChange(toggleValue(selected, option.value))}
              className="accent-ink h-4 w-4 shrink-0 lg:h-3.5 lg:w-3.5"
            />
            <span className="min-w-0 truncate">{option.label}</span>
            <span className="text-ink-3 ml-auto text-[13px]">
              {option.count}
            </span>
          </label>
        </li>
      ))}
    </ul>
  )
}

function selectionSummary(selected: string[], options: FilterOption[]) {
  return selected.length
    ? `${selected.length} selected`
    : `${options.length} · any`
}

function CollapsedGroup({
  title,
  options,
  selected,
  onChange,
}: {
  title: string
  options: FilterOption[]
  selected: string[]
  onChange: (next: string[]) => void
}) {
  if (options.length === 0) return null
  return (
    <details
      open={selected.length > 0 || undefined}
      className="border-rule group border-t pt-3"
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 lg:min-h-6 [&::-webkit-details-marker]:hidden">
        <span className={groupLabelClassName}>{title}</span>
        <span className="text-ink-3 flex items-center gap-1 text-[13px]">
          {selectionSummary(selected, options)}
          <BiChevronDown
            aria-hidden
            className="h-4 w-4 transition-transform group-open:rotate-180"
          />
        </span>
      </summary>
      <div className="pt-1 pb-1">
        <OptionCheckboxes
          options={options}
          selected={selected}
          onChange={onChange}
        />
      </div>
    </details>
  )
}

function SectorGroup({
  primary,
  more,
  selected,
  onChange,
}: {
  primary: FilterOption[]
  more: FilterOption[]
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hiddenSelection = more.some((option) => selected.includes(option.value))
  const showMore = expanded || hiddenSelection
  return (
    <div className="border-rule border-t pt-3 max-lg:border-t-0 max-lg:pt-0">
      <fieldset>
        <legend className={cx(groupLabelClassName, 'mb-1')}>Sector</legend>
        <OptionCheckboxes
          options={showMore ? [...primary, ...more] : primary}
          selected={selected}
          onChange={onChange}
        />
        {more.length > 0 && !hiddenSelection && (
          <button
            type="button"
            aria-expanded={showMore}
            onClick={() => setExpanded(!expanded)}
            className="text-link hover:text-link-hover mt-0.5 min-h-11 text-[13px] font-semibold hover:underline lg:min-h-6"
          >
            {showMore ? 'Fewer sectors' : `+ ${more.length} more sectors`}
          </button>
        )}
      </fieldset>
    </div>
  )
}

export function DirectoryFilters({
  options,
}: {
  options: DirectoryFilterOptions
}) {
  const directory = useDirectoryQuery()
  const [sheetOpen, setSheetOpen] = useState(false)
  const { filters, activeFilterCount } = directory
  const panelFilterCount = activeFilterCount - (filters.query.trim() ? 1 : 0)

  return (
    <div className="flex flex-col gap-3 lg:gap-[18px]">
      <label className="block">
        <span className="sr-only">Search companies</span>
        <input
          type="search"
          value={filters.query}
          onChange={(event) => directory.setQuery(event.target.value)}
          placeholder="Search by name or alias"
          className="border-ink bg-field text-ink h-11 w-full rounded-sm border-[1.5px] px-3 text-[15px] lg:h-9"
        />
        <span className="text-ink-3 mt-1 hidden text-xs lg:block">
          Matches company names and aliases
        </span>
      </label>

      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          aria-expanded={sheetOpen}
          aria-controls="directory-filter-panel"
          onClick={() => setSheetOpen(!sheetOpen)}
          className="border-ink text-ink hover:bg-paper-deep inline-flex min-h-11 items-center gap-2 rounded-sm border-[1.5px] px-4 text-sm font-semibold"
        >
          Filters{panelFilterCount > 0 ? ` (${panelFilterCount})` : ''}
          <BiChevronDown
            aria-hidden
            className={cx(
              'h-4 w-4 transition-transform',
              sheetOpen && 'rotate-180',
            )}
          />
        </button>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={directory.clearFilters}
            className="text-link hover:text-link-hover min-h-11 px-1 text-sm font-semibold underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div
        id="directory-filter-panel"
        className={cx(
          'flex flex-col gap-[18px]',
          'max-lg:border-ink max-lg:bg-field max-lg:rounded-sm max-lg:border-[1.5px] max-lg:p-4 max-lg:shadow-md',
          !sheetOpen && 'max-lg:hidden',
        )}
      >
        {activeFilterCount > 0 && (
          <p className="text-ink-2 hidden items-center justify-between text-[13px] lg:flex">
            {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'}{' '}
            on
            <button
              type="button"
              onClick={directory.clearFilters}
              className="text-link hover:text-link-hover font-semibold underline"
            >
              Clear all
            </button>
          </p>
        )}
        <SectorGroup
          primary={options.primarySectors}
          more={options.moreSectors}
          selected={filters.sectors}
          onChange={directory.setSectors}
        />
        <CollapsedGroup
          title="Country"
          options={options.countries}
          selected={filters.countries}
          onChange={directory.setCountries}
        />
        <CollapsedGroup
          title="Stage"
          options={options.stages}
          selected={filters.stages}
          onChange={directory.setStages}
        />
        <CollapsedGroup
          title="Source type"
          options={options.sources}
          selected={filters.sources}
          onChange={directory.setSources}
        />
        <div className="border-rule border-t pt-3">
          <fieldset>
            <legend className={cx(groupLabelClassName, 'mb-1')}>Status</legend>
            <OptionCheckboxes
              options={options.statuses}
              selected={filters.statuses}
              onChange={directory.setStatuses}
            />
          </fieldset>
        </div>
        <button
          type="button"
          onClick={() => setSheetOpen(false)}
          className="bg-ink text-field min-h-11 rounded-sm px-4 text-sm font-semibold lg:hidden"
        >
          Show results
        </button>
      </div>
    </div>
  )
}

export function DirectoryFiltersPlaceholder() {
  return (
    <div className="flex flex-col gap-3 lg:gap-[18px]">
      <div className="border-ink bg-field text-ink-3 flex h-11 items-center rounded-sm border-[1.5px] px-3 text-[15px] lg:h-9">
        Search by name or alias
      </div>
      <p className="text-ink-3 border-rule border-t pt-3 text-[13px]">
        Loading filters…
      </p>
    </div>
  )
}
