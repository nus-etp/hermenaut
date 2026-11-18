import type { ReactNode } from 'react'

import { cx } from '~/lib/cn'

export type TapeVariant = 'mustard' | 'blue' | 'sage' | 'terra'

const variantClasses: Record<TapeVariant, string> = {
  mustard: '',
  blue: 'tape-blue',
  sage: 'tape-sage',
  terra: 'tape-terra',
}

interface TapeProps {
  children: ReactNode
  variant?: TapeVariant
  className?: string
}

export function Tape({ children, variant = 'mustard', className }: TapeProps) {
  return (
    <span className={cx('tape', variantClasses[variant], className)}>
      {children}
    </span>
  )
}
