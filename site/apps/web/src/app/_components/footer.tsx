import Link from 'next/link'

import { meta } from '~/lib/data'
import { REPOSITORY_URL } from '~/lib/site'

const buildTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
})

function formatBuildTime(value: string) {
  const parsed = new Date(value)
  if (isNaN(parsed.getTime())) return value
  return `${buildTimeFormat.format(parsed)} UTC`
}

export function Footer() {
  return (
    <footer className="border-ink text-ink-2 mt-16 border-t">
      <div className="sheet flex flex-col gap-3 py-6 text-[13px] sm:flex-row sm:items-center sm:justify-between">
        <p>
          Last build{' '}
          <time dateTime={meta.generatedAt}>
            {formatBuildTime(meta.generatedAt)}
          </time>{' '}
          · {meta.totalBriefs} living briefs · {meta.totalDigests} daily digests
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          <li>
            <Link
              href="/about/"
              className="text-ink inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline sm:min-h-0"
            >
              About &amp; method
            </Link>
          </li>
          <li>
            <a
              href={REPOSITORY_URL}
              className="text-ink inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline sm:min-h-0"
            >
              Source on GitHub
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
