'use client'

import { useState } from 'react'

import type { DirectoryRow, SortDirection, SortKey } from './directory-rows'
import { DirectoryListingView } from './directory-listing'
import { useDirectoryQuery } from './directory-query'
import { filterRows, PAGE_SIZE, SORT_LABELS, sortRows } from './directory-rows'

interface CompanyDirectoryProps {
  rows: DirectoryRow[]
  now: string
}

function sortDescription(sort: SortKey, direction: SortDirection) {
  if (sort === 'signal' && direction === 'desc')
    return 'Latest signal first, movers on top'
  const order = direction === 'asc' ? 'ascending' : 'descending'
  return `Sorted by ${SORT_LABELS[sort].toLowerCase()}, ${order}`
}

function matchSummary(matchCount: number, activeFilterCount: number) {
  if (activeFilterCount === 0) return ''
  return `${matchCount} ${matchCount === 1 ? 'match' : 'matches'} · `
}

export function CompanyDirectory({ rows, now }: CompanyDirectoryProps) {
  const directory = useDirectoryQuery()
  const { filters, sort, direction, activeFilterCount } = directory

  const matches = sortRows(filterRows(rows, filters), sort, direction)
  const inactiveMatchCount = matches.filter((row) => row.inactive).length

  const revealKey = JSON.stringify([filters, sort, direction])
  const [reveal, setReveal] = useState({ key: revealKey, count: PAGE_SIZE })
  const visibleCount = reveal.key === revealKey ? reveal.count : PAGE_SIZE
  const visibleRows = matches.slice(0, visibleCount)

  const statusNote = `${matchSummary(matches.length, activeFilterCount)}${sortDescription(sort, direction)} · struck-off listed last`

  return (
    <DirectoryListingView
      rows={visibleRows}
      matchCount={matches.length}
      inactiveMatchCount={inactiveMatchCount}
      sort={sort}
      direction={direction}
      now={now}
      statusNote={statusNote}
      onSort={directory.chooseSort}
      onShowMore={() =>
        setReveal({ key: revealKey, count: visibleCount + PAGE_SIZE })
      }
      onShowAll={() => setReveal({ key: revealKey, count: matches.length })}
      onReset={directory.clearFilters}
    />
  )
}
