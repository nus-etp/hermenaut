'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BiChevronDown } from 'react-icons/bi'

import type { MetricColumn } from './metrics-columns'
import { cx } from '~/lib/cn'
import { DeltaArrow } from './metrics-columns'
import { Tape } from './paper'

interface MetricsLegendProps {
  columns: MetricColumn[]
  latestEditionLabel?: string
}

export function columnHelpId(column: MetricColumn) {
  return `metrics-help-${column.key}`
}

export function MetricsLegend({
  columns,
  latestEditionLabel,
}: MetricsLegendProps) {
  const [notesOpen, setNotesOpen] = useState(false)
  return (
    <section
      aria-labelledby="metrics-legend-title"
      className="border-rule border-y py-1.5 md:py-4"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 id="metrics-legend-title">
          <Tape variant="blue">How to read this</Tape>
        </h2>
        <button
          type="button"
          aria-expanded={notesOpen}
          aria-controls="metrics-legend-notes"
          onClick={() => setNotesOpen((open) => !open)}
          className="text-link hover:text-link-hover inline-flex min-h-11 items-center gap-1 text-sm font-semibold md:hidden"
        >
          {notesOpen ? 'Hide notes' : 'Show notes'}
          <BiChevronDown
            aria-hidden
            className={cx(
              'h-4 w-4 transition-transform',
              notesOpen && 'rotate-180',
            )}
          />
        </button>
        <Link
          href="/about/"
          className="text-link hover:text-link-hover inline-flex min-h-11 items-center text-sm underline max-md:ml-auto md:min-h-0"
        >
          <span className="md:hidden">Full method</span>
          <span className="hidden md:inline">
            Full method on About &amp; method
          </span>
        </Link>
      </div>
      <div
        id="metrics-legend-notes"
        className={cx('max-md:pb-2.5', !notesOpen && 'max-md:hidden')}
      >
        <ul className="text-ink-2 mt-3 grid gap-x-10 gap-y-1.5 text-sm/snug md:grid-cols-2">
          <li>
            <strong className="text-ink font-semibold">Composite</strong> is the
            mean percentile across funding, open roles, GitHub stars, HN
            mentions, headcount and investor listings. A missing input counts as
            0, so breadth of public evidence raises a score. It measures
            visibility, not climate relevance or quality.
          </li>
          <li>
            <strong className="text-ink font-semibold">— no data</strong> means
            nothing was found, not zero. Blank cells always sort last, and a
            rank counts only companies with a value in the sorted column.
          </li>
          <li>
            <span className="text-ink-3 decoration-terra-ink line-through decoration-[1.5px]">
              515
            </span>{' '}
            An HN count struck through belongs to a short or common-word name.
            It is mostly namesakes, so it is never ranked or used in the
            composite.
          </li>
          <li>
            <strong className="text-ink font-semibold">*</strong> marks a stage
            self-reported on Startup SG. Companies struck off at ACRA are hidden
            unless you include them; then they are grouped last, stamped, and
            never ranked.
          </li>
          {latestEditionLabel && (
            <li>
              <span className="wash text-ink rounded-sm px-1.5">Blue wash</span>{' '}
              marks a company that moved in the latest edition (
              {latestEditionLabel}).
            </li>
          )}
          <li>
            Open roles show the 30-day change as{' '}
            <span className="text-sage-ink font-semibold whitespace-nowrap">
              <DeltaArrow rising />
              more
            </span>{' '}
            or{' '}
            <span className="text-terra-ink font-semibold whitespace-nowrap">
              <DeltaArrow rising={false} />
              fewer
            </span>{' '}
            postings.
          </li>
        </ul>
        <details className="group mt-3">
          <summary className="text-ink hover:text-link w-fit cursor-pointer text-sm font-semibold">
            Column definitions and sources
          </summary>
          <dl className="mt-3 grid gap-x-10 gap-y-3 text-sm/snug sm:grid-cols-2 xl:grid-cols-3">
            {columns.map((column) => (
              <div key={column.key} id={columnHelpId(column)}>
                <dt className="text-ink font-semibold">{column.label}</dt>
                <dd className="text-ink-2">{column.help}</dd>
                <dd className="text-ink-3 mt-0.5 text-xs">
                  Source: {column.source}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      </div>
    </section>
  )
}
