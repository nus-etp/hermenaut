'use client'

import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from 'nuqs'

import type { DirectoryFilters, SortDirection, SortKey } from './directory-rows'
import { DEFAULT_DIRECTION, SORT_DIRECTIONS, SORT_KEYS } from './directory-rows'

const listParser = parseAsArrayOf(parseAsString).withDefault([])

function emptyToNull<T>(values: T[]) {
  return values.length ? values : null
}

export function useDirectoryQuery() {
  const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''))
  const [sectors, setSectors] = useQueryState('sector', listParser)
  const [countries, setCountries] = useQueryState('region', listParser)
  const [stages, setStages] = useQueryState('stage', listParser)
  const [sources, setSources] = useQueryState('source', listParser)
  const [statuses, setStatuses] = useQueryState('status', listParser)
  const [sort, setSort] = useQueryState(
    'sort',
    parseAsStringEnum<SortKey>([...SORT_KEYS]).withDefault('signal'),
  )
  const [directionParam, setDirection] = useQueryState(
    'dir',
    parseAsStringEnum<SortDirection>([...SORT_DIRECTIONS]),
  )

  const direction = directionParam ?? DEFAULT_DIRECTION[sort]
  const filters: DirectoryFilters = {
    query,
    sectors,
    countries,
    stages,
    sources,
    statuses,
  }
  const activeFilterCount =
    (query.trim() ? 1 : 0) +
    sectors.length +
    countries.length +
    stages.length +
    sources.length +
    statuses.length

  const chooseSort = (next: SortKey) => {
    if (next === sort) {
      const flipped = direction === 'asc' ? 'desc' : 'asc'
      void setDirection(flipped === DEFAULT_DIRECTION[next] ? null : flipped)
      return
    }
    void setSort(next === 'signal' ? null : next)
    void setDirection(null)
  }

  const clearFilters = () => {
    void setQuery(null)
    void setSectors(null)
    void setCountries(null)
    void setStages(null)
    void setSources(null)
    void setStatuses(null)
  }

  return {
    filters,
    activeFilterCount,
    sort,
    direction,
    chooseSort,
    clearFilters,
    setQuery: (value: string) => void setQuery(value || null),
    setSectors: (values: string[]) => void setSectors(emptyToNull(values)),
    setCountries: (values: string[]) => void setCountries(emptyToNull(values)),
    setStages: (values: string[]) => void setStages(emptyToNull(values)),
    setSources: (values: string[]) => void setSources(emptyToNull(values)),
    setStatuses: (values: string[]) => void setStatuses(emptyToNull(values)),
  }
}
