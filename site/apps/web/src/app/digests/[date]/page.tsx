import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { format, parseISO } from 'date-fns'

import { allEditions, getEdition, SIGNAL_TYPES } from '~/lib/data'
import { EditionMovers } from '../../_components/edition-movers'
import { EditionStrip } from '../../_components/edition-strip'

interface Params {
  params: Promise<{ date: string }>
}

export function generateStaticParams() {
  return allEditions().map((edition) => ({ date: edition.date }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { date } = await params
  const edition = getEdition(date)
  if (!edition) return { title: 'Edition not found · hermenaut' }
  const readableDate = format(parseISO(edition.date), 'd MMM yyyy')
  return {
    title: `Edition · ${readableDate} · hermenaut`,
    description: `${edition.companiesMoved} watchlist companies moved on ${readableDate}, with ${edition.signalCount} sourced signals.`,
  }
}

export default async function EditionPage({ params }: Params) {
  const { date } = await params
  const edition = getEdition(date)
  if (!edition) notFound()

  return (
    <article className="flex flex-col gap-5 pb-8">
      <EditionStrip edition={edition} titleAs="h1" />
      <EditionMovers movers={edition.movers} signalOrder={SIGNAL_TYPES} />
    </article>
  )
}
