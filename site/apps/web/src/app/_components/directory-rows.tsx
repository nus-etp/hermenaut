import { matchesSectorTags } from '~/lib/sectors'

export const SORT_KEYS = [
  'signal',
  'name',
  'sector',
  'country',
  'stage',
  'brief',
] as const
export type SortKey = (typeof SORT_KEYS)[number]
export type SortDirection = 'asc' | 'desc'
export const SORT_DIRECTIONS = ['asc', 'desc'] as const

export const STATUS_KEYS = ['moved', 'brief', 'hide-struck'] as const
export type StatusKey = (typeof STATUS_KEYS)[number]

export const PAGE_SIZE = 50

export const DEFAULT_DIRECTION: Record<SortKey, SortDirection> = {
  signal: 'desc',
  name: 'asc',
  sector: 'asc',
  country: 'asc',
  stage: 'desc',
  brief: 'desc',
}

export const SORT_LABELS: Record<SortKey, string> = {
  signal: 'Last signal',
  name: 'Company',
  sector: 'Sector',
  country: 'Country',
  stage: 'Stage',
  brief: 'Brief',
}

export interface DirectoryRow {
  slug: string
  name: string
  searchText: string
  summary: string
  sector?: string
  sectorTags: string[]
  country?: string
  stage?: string
  stageRank?: number
  stageSelfReported: boolean
  hasBrief: boolean
  latestSignalDate?: string
  moved: boolean
  sourceTypes: string[]
  inactive: boolean
  statusLabel?: string
  statusStamp?: string
}

export interface FilterOption {
  value: string
  label: string
  count: number
}

export interface DirectoryFilters {
  query: string
  sectors: string[]
  countries: string[]
  stages: string[]
  sources: string[]
  statuses: string[]
}

function includesAny(values: string[], selected: string[]) {
  return values.some((value) => selected.includes(value))
}

function matchesFilters(row: DirectoryRow, filters: DirectoryFilters) {
  const query = filters.query.trim().toLowerCase()
  if (query && !row.searchText.includes(query)) return false
  if (!matchesSectorTags(row, filters.sectors)) return false
  if (
    filters.countries.length &&
    (!row.country || !filters.countries.includes(row.country))
  )
    return false
  if (
    filters.stages.length &&
    (!row.stage || !filters.stages.includes(row.stage))
  )
    return false
  if (filters.sources.length && !includesAny(row.sourceTypes, filters.sources))
    return false
  if (filters.statuses.includes('moved') && !row.moved) return false
  if (filters.statuses.includes('brief') && !row.hasBrief) return false
  if (filters.statuses.includes('hide-struck') && row.inactive) return false
  return true
}

export function filterRows(rows: DirectoryRow[], filters: DirectoryFilters) {
  return rows.filter((row) => matchesFilters(row, filters))
}

function compareOptional<T>(
  first: T | undefined,
  second: T | undefined,
  compare: (a: T, b: T) => number,
  direction: SortDirection,
) {
  if (first === undefined && second === undefined) return 0
  if (first === undefined) return 1
  if (second === undefined) return -1
  const result = compare(first, second)
  return direction === 'asc' ? result : -result
}

const compareText = (first: string, second: string) =>
  first.localeCompare(second)
const compareNumber = (first: number, second: number) => first - second

function compareBySort(
  first: DirectoryRow,
  second: DirectoryRow,
  sort: SortKey,
  direction: SortDirection,
) {
  switch (sort) {
    case 'signal':
      return (
        compareOptional(
          first.latestSignalDate,
          second.latestSignalDate,
          compareText,
          direction,
        ) ||
        compareOptional(
          Number(first.moved),
          Number(second.moved),
          compareNumber,
          direction,
        ) ||
        Number(second.hasBrief) - Number(first.hasBrief)
      )
    case 'name':
      return compareOptional(first.name, second.name, compareText, direction)
    case 'sector':
      return compareOptional(
        first.sector,
        second.sector,
        compareText,
        direction,
      )
    case 'country':
      return compareOptional(
        first.country,
        second.country,
        compareText,
        direction,
      )
    case 'stage':
      return compareOptional(
        first.stageRank,
        second.stageRank,
        compareNumber,
        direction,
      )
    case 'brief':
      return compareOptional(
        Number(first.hasBrief),
        Number(second.hasBrief),
        compareNumber,
        direction,
      )
  }
}

export function sortRows(
  rows: DirectoryRow[],
  sort: SortKey,
  direction: SortDirection,
) {
  const sorted = [...rows].sort(
    (first, second) =>
      compareBySort(first, second, sort, direction) ||
      first.name.localeCompare(second.name),
  )
  return [
    ...sorted.filter((row) => !row.inactive),
    ...sorted.filter((row) => row.inactive),
  ]
}
