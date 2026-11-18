import type { TapeVariant } from './tape'
import type { SignalType } from '~/lib/data'
import { cx } from '~/lib/cn'
import { Tape } from './tape'

const signalTapeVariants: Record<SignalType, TapeVariant> = {
  Funding: 'sage',
  Partnership: 'sage',
  'Case study': 'sage',
  Patent: 'blue',
  Filing: 'blue',
  Release: 'blue',
  Tender: 'mustard',
  News: 'mustard',
  Hiring: 'terra',
}

interface EditionSignalTapeProps {
  type: SignalType
  count?: number
  size?: 'sm' | 'md'
  className?: string
}

export function EditionSignalTape({
  type,
  count,
  size = 'md',
  className,
}: EditionSignalTapeProps) {
  return (
    <Tape
      variant={signalTapeVariants[type]}
      className={cx(
        size === 'sm' && 'px-1.5 text-[10px] leading-[14px] tracking-[0.07em]',
        className,
      )}
    >
      {type}
      {count !== undefined && (
        <span className="ml-1 font-semibold">{count}</span>
      )}
    </Tape>
  )
}
