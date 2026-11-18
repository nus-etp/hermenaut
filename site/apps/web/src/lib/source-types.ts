export const SOURCE_TYPE_LABELS: Record<string, string> = {
  appstore_dev: 'App Store',
  ats_jobs: 'Jobs',
  github_org: 'GitHub',
  html_scrape: 'Website',
  rss: 'News feed',
}

export function sourceTypeLabel(type: string): string {
  const known = SOURCE_TYPE_LABELS[type]
  if (known) return known
  const label = type.split('_').filter(Boolean).join(' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}
