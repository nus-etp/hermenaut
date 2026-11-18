import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  format,
  isValid,
} from 'date-fns'

import { cx } from '~/lib/cn'
import { toDate } from './edition-date'

function plural(count: number, unit: string) {
  return `${count} ${unit}${count === 1 ? '' : 's'} ago`
}

export function formatRelativeAge(
  value: string | Date,
  now: Date = new Date(),
  compact = false,
) {
  const date = toDate(value)
  if (!isValid(date)) return ''
  const days = differenceInCalendarDays(now, date)
  if (days <= 0) return compact ? '0d' : 'today'
  if (days < 60) {
    if (compact) return `${days}d`
    return days === 1 ? 'yesterday' : plural(days, 'day')
  }
  const months = differenceInCalendarMonths(now, date)
  if (months < 24) return compact ? `${months}mo` : plural(months, 'month')
  const years = Math.floor(months / 12)
  return compact ? `${years}y` : plural(years, 'year')
}

interface RelativeAgeProps {
  date: string | Date
  now?: Date
  compact?: boolean
  className?: string
}

export function RelativeAge({
  date,
  now,
  compact = false,
  className,
}: RelativeAgeProps) {
  const parsed = toDate(date)
  if (!isValid(parsed)) return null
  return (
    <time
      dateTime={format(parsed, 'yyyy-MM-dd')}
      title={format(parsed, 'd MMM yyyy')}
      className={cx(className)}
    >
      {formatRelativeAge(parsed, now, compact)}
    </time>
  )
}
