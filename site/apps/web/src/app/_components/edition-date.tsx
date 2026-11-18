import { format, isValid, parseISO } from 'date-fns'

import { cx } from '~/lib/cn'

export type EditionDateSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<EditionDateSize, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-[1.875rem]',
}

interface EditionDateProps {
  date: string | Date
  pattern?: string
  size?: EditionDateSize
  className?: string
}

export function toDate(value: string | Date) {
  return typeof value === 'string' ? parseISO(value) : value
}

export function EditionDate({
  date,
  pattern = 'EEE d MMM yyyy',
  size = 'lg',
  className,
}: EditionDateProps) {
  const parsed = toDate(date)
  if (!isValid(parsed)) {
    return <span className={className}>{String(date)}</span>
  }
  return (
    <time
      dateTime={format(parsed, 'yyyy-MM-dd')}
      className={cx('font-hand leading-none', sizeClasses[size], className)}
    >
      {format(parsed, pattern)}
    </time>
  )
}
