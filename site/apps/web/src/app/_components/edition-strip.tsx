import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { BiLeftArrowAlt, BiRightArrowAlt } from 'react-icons/bi'

import type { Edition } from '~/lib/data'
import { cx } from '~/lib/cn'
import { SIGNAL_TYPES } from '~/lib/data'
import { EditionDate } from './edition-date'
import { EditionSignalTape } from './edition-signal-tape'
import { RelativeAge } from './relative-age'
import { Tape } from './tape'

interface EditionStripProps {
  edition?: Edition
  titleAs?: 'h1' | 'h2' | 'p'
  linkToFull?: boolean
  showNextLink?: boolean
  showSignalTypes?: boolean
  showPositionLabels?: boolean
  freshnessNow?: Date
  className?: string
}

const stripClassName =
  'border-rule from-tape-mustard/12 -mx-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-b bg-linear-to-b to-transparent px-4 py-3 sm:-mx-8 sm:min-h-16 sm:px-8 sm:py-2'

const pagerLinkClassName =
  'text-ink hover:text-link inline-flex min-h-11 items-center gap-1 font-semibold hover:underline sm:min-h-8'

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

export function editionHref(date: string) {
  return `/digests/${date}/`
}

function PagerDate({ date }: { date: string }) {
  return <time dateTime={date}>{format(parseISO(date), 'EEE d MMM')}</time>
}

export function EditionStrip({
  edition,
  titleAs: Title = 'p',
  linkToFull = false,
  showNextLink = true,
  showSignalTypes = true,
  showPositionLabels = true,
  freshnessNow,
  className,
}: EditionStripProps) {
  if (!edition) {
    return (
      <header className={cx(stripClassName, className)}>
        <Title className="m-0 flex items-center gap-3 text-base font-normal">
          <Tape>Edition</Tape>
          <span className="text-ink-2 text-[15px]">
            No edition has been published yet.
          </span>
        </Title>
      </header>
    )
  }

  const typeCounts = SIGNAL_TYPES.flatMap((type) => {
    const count = edition.signalTypeCounts[type]
    return count ? [{ type, count }] : []
  })

  return (
    <header className={cx(stripClassName, className)}>
      <Title className="m-0 flex items-center gap-3 text-base font-normal">
        <Tape>Edition</Tape>
        <EditionDate date={edition.date} size="lg" className="pt-1.5" />
      </Title>
      <p className="text-ink-2 text-[15px]">
        <b className="text-ink font-semibold">
          {plural(edition.companiesMoved, 'company', 'companies')} moved
        </b>
        {' · '}
        {plural(edition.signalCount, 'signal')}
      </p>
      {freshnessNow && !edition.nextDate && (
        <p className="text-ink-2 text-sm">
          Latest edition ·{' '}
          <RelativeAge date={edition.date} now={freshnessNow} />
        </p>
      )}
      {showSignalTypes && typeCounts.length > 0 && (
        <ul
          aria-label="Signals by type"
          className="flex flex-wrap gap-x-2 gap-y-1.5"
        >
          {typeCounts.map(({ type, count }) => (
            <li key={type}>
              <EditionSignalTape type={type} count={count} size="sm" />
            </li>
          ))}
        </ul>
      )}
      <nav
        aria-label="Editions"
        className="text-ink-2 flex w-full flex-wrap items-center gap-x-5 text-sm sm:ml-auto sm:w-auto"
      >
        {edition.prevDate ? (
          <Link
            href={editionHref(edition.prevDate)}
            className={pagerLinkClassName}
          >
            <BiLeftArrowAlt aria-hidden className="h-4 w-4" />
            <span className="sr-only">Previous edition, </span>
            <PagerDate date={edition.prevDate} />
          </Link>
        ) : (
          showPositionLabels && <span>First edition</span>
        )}
        {showNextLink &&
          (edition.nextDate ? (
            <Link
              href={editionHref(edition.nextDate)}
              className={pagerLinkClassName}
            >
              <span className="sr-only">Next edition, </span>
              <PagerDate date={edition.nextDate} />
              <BiRightArrowAlt aria-hidden className="h-4 w-4" />
            </Link>
          ) : (
            showPositionLabels && <span>Latest edition</span>
          ))}
        {linkToFull ? (
          <Link
            href={editionHref(edition.date)}
            className={cx(pagerLinkClassName, 'text-link underline')}
          >
            Read the full edition
            <BiRightArrowAlt aria-hidden className="h-4 w-4" />
          </Link>
        ) : (
          <Link href="/digests/" className={pagerLinkClassName}>
            All editions
          </Link>
        )}
      </nav>
    </header>
  )
}
