import { BiLinkExternal } from 'react-icons/bi'

import type { Company } from '~/lib/data'
import { Stamp } from './paper'

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '/hermenaut'
const INFOGRAPHIC_WIDTH = 1024
const INFOGRAPHIC_HEIGHT = 768

function firstSentence(text?: string) {
  if (!text) return undefined
  const [sentence = ''] = text.split(/(?<=[.!?])\s+(?=[A-Z])/)
  const trimmed = sentence.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function BriefInfographic({ company }: { company: Company }) {
  if (!company.hasBrief) return null
  if (!company.hasInfographic) return <InfographicPending />

  const imageUrl = `${BASE_PATH}/briefs/${company.slug}/infographic.png`
  const caption = firstSentence(company.thesis)

  return (
    <figure className="max-w-[720px]">
      <div className="bg-field relative rotate-[-0.25deg] p-2 shadow-md sm:p-3">
        <span
          aria-hidden
          className="tape absolute -top-2.5 left-6 h-5 w-20 rotate-[-4deg]"
        />
        <span
          aria-hidden
          className="tape absolute -top-2 right-8 h-5 w-16 rotate-[3deg]"
        />
        <a href={imageUrl} className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`${company.name} infographic summarising profile, funding and recent signals`}
            width={INFOGRAPHIC_WIDTH}
            height={INFOGRAPHIC_HEIGHT}
            className="block h-auto w-full"
          />
        </a>
      </div>
      <figcaption className="mt-4 flex flex-col gap-1.5 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        {caption && <span className="text-ink-2 max-w-[60ch]">{caption}</span>}
        <a
          href={imageUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="text-link hover:text-ink inline-flex min-h-11 shrink-0 items-center gap-1 font-semibold underline underline-offset-[0.2em] sm:min-h-0"
        >
          Open full size
          <BiLinkExternal aria-hidden className="h-3.5 w-3.5" />
        </a>
      </figcaption>
    </figure>
  )
}

function InfographicPending() {
  return (
    <div className="border-rule flex max-w-[720px] flex-wrap items-center gap-x-4 gap-y-2 border-y border-dashed py-3">
      <Stamp title="Layer 4 has not drawn this infographic yet">Pending</Stamp>
      <p className="text-ink-2 text-sm">
        Infographic arrives with the next pipeline run.
      </p>
    </div>
  )
}
