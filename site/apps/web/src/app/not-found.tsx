import type { Metadata } from 'next'
import Link from 'next/link'
import { BiArrowBack } from 'react-icons/bi'

import { Stamp } from './_components/paper'

export const metadata: Metadata = {
  title: 'Not found · hermenaut',
}

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-start gap-4 pt-10 pb-16 sm:pt-16">
      <Stamp>Not on the sheet</Stamp>
      <h1 className="text-ink text-[2rem] leading-tight font-bold text-balance">
        Nothing tracked here
      </h1>
      <p className="text-ink-2 max-w-[60ch] text-base/relaxed">
        No company, edition or page lives at this address. The company may have
        left the watchlist, or the link may be mistyped.
      </p>
      <ul className="text-ink flex flex-wrap gap-x-6 gap-y-1 text-sm font-semibold">
        <li>
          <Link
            href="/"
            className="text-link hover:text-ink inline-flex min-h-11 items-center gap-1.5 underline underline-offset-[0.2em]"
          >
            <BiArrowBack aria-hidden className="h-4 w-4" />
            Search the directory
          </Link>
        </li>
        <li>
          <Link
            href="/digests/"
            className="text-link hover:text-ink inline-flex min-h-11 items-center underline underline-offset-[0.2em]"
          >
            Today’s edition
          </Link>
        </li>
      </ul>
    </div>
  )
}
