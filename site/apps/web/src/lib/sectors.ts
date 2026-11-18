export const UNCLASSIFIED_SECTOR = 'Unclassified'

export function sectorBucketsOf(record: { sectorTags: string[] }): string[] {
  return record.sectorTags.length ? record.sectorTags : [UNCLASSIFIED_SECTOR]
}

export function matchesSectorTags(
  record: { sectorTags: string[] },
  selected: string[],
): boolean {
  if (!selected.length) return true
  return sectorBucketsOf(record).some((tag) => selected.includes(tag))
}
