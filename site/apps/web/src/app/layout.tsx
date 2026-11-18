import type { Metadata } from 'next'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import '~/app/globals.css'

import { cx } from '~/lib/cn'
import { playpenSans, sourceSans } from '~/lib/fonts'
import { Footer } from './_components/footer'
import { Header } from './_components/header'
import { ClientProviders } from './provider'

const SITE_NAME = 'hermenaut'
const SITE_DESCRIPTION =
  'A daily market sheet of Southeast Asian climate and deep-tech companies, kept current by an autonomous agent over the NUSX watchlist.'

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cx(sourceSans.variable, playpenSans.variable)}
    >
      <body className="bg-paper text-ink flex min-h-dvh flex-col font-sans text-sm antialiased">
        <ClientProviders>
          <a
            href="#main-content"
            className="focus:bg-field focus:text-ink focus:border-ink sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-3 focus:z-50 focus:border-[1.5px] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
          >
            Skip to content
          </a>
          <Header />
          <NuqsAdapter>
            <main id="main-content" className="sheet flex flex-1 flex-col">
              {props.children}
            </main>
          </NuqsAdapter>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  )
}
