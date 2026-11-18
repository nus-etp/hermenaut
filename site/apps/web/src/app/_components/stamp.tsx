import type { ReactNode } from 'react'

import { cx } from '~/lib/cn'

interface StampProps {
  children: ReactNode
  title?: string
  className?: string
}

export function Stamp({ children, title, className }: StampProps) {
  return (
    <span title={title} className={cx('stamp', className)}>
      {children}
    </span>
  )
}
