import { cx } from '~/lib/cn'

interface NoDataProps {
  label?: string
  className?: string
}

export function NoData({ label = 'no data', className }: NoDataProps) {
  return (
    <span className={cx('text-ink-3 text-xs font-normal', className)}>
      — {label}
    </span>
  )
}
