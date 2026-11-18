import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import type { Company } from '~/lib/data'
import {
  briefs,
  companies,
  companyBySlug,
  fundingRoundsBySlug,
  latestEdition,
  meta,
  metrics,
  sourcesBySlug,
} from '~/lib/data'
import { REPOSITORY_URL } from '~/lib/site'
import { BriefHeader } from '../../_components/brief-header'
import { BriefInfographic } from '../../_components/brief-infographic'
import { BriefMissing } from '../../_components/brief-missing'
import {
  BriefFunding,
  BriefRecord,
  BriefSources,
} from '../../_components/brief-side'
import { Markdown } from '../../_components/markdown'

interface Params {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return companies.map((company) => ({ slug: company.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const company = companyBySlug.get(slug)
  if (!company) return {}
  return {
    title: `${company.name} · hermenaut`,
    description: company.thesis ?? (company.description || undefined),
  }
}

export default async function CompanyPage({ params }: Params) {
  const { slug } = await params
  const company = companyBySlug.get(slug)
  if (!company) notFound()

  const brief = briefs[slug]
  const rounds = fundingRoundsBySlug[slug] ?? []
  const sources = sourcesBySlug[slug] ?? []
  const companyMetrics = metrics.companies.find((row) => row.slug === slug)
  const now = new Date(meta.generatedAt)

  return (
    <article className="pb-4">
      <BriefHeader
        company={company}
        companyMetrics={companyMetrics}
        latestEditionDate={latestEdition()?.date}
        now={now}
      />

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,45rem)_minmax(18rem,24rem)] lg:gap-16 xl:gap-24">
        <div className="flex min-w-0 flex-col gap-8">
          <BriefInfographic company={company} />
          {brief ? (
            <Markdown className="[&>*:first-child]:mt-0">
              {stripDuplicateSections(stripBriefHeader(brief))}
            </Markdown>
          ) : (
            <BriefMissing company={company} />
          )}
          <CorrectionLink company={company} />
        </div>

        <aside
          aria-label={`${company.name} record`}
          className="flex min-w-0 flex-col gap-8"
        >
          <BriefRecord company={company} now={now} />
          <BriefFunding rounds={rounds} />
          <BriefSources sources={sources} />
        </aside>
      </div>
    </article>
  )
}

function stripBriefHeader(markdown: string) {
  return markdown
    .replace(/^# .*\n/, '')
    .replace(/^_Last updated:.*_\n/m, '')
    .replace(/^!\[Infographic]\(infographic\.png\)\n/m, '')
    .trim()
}

const SIDE_COLUMN_SECTIONS = ['funding history']
const PROFILE_HEADING = 'profile'
const PROFILE_FIELDS_SHOWN_ABOVE = [
  'sector',
  'region',
  'stage',
  'stage / funding',
]

function headingOf(section: string) {
  return (/^## (.+)$/m.exec(section)?.[1] ?? '').trim().toLowerCase()
}

function profileFieldOf(line: string) {
  return (/^\s*-\s*([^:]+):/.exec(line)?.[1] ?? '').trim().toLowerCase()
}

function stripProfileFieldsShownAbove(section: string) {
  const [heading = '', ...lines] = section.split('\n')
  const remaining = lines.filter(
    (line) => !PROFILE_FIELDS_SHOWN_ABOVE.includes(profileFieldOf(line)),
  )
  const hasContent = remaining.some((line) => line.trim() !== '')
  return hasContent ? [heading, ...remaining].join('\n') : ''
}

function stripDuplicateSections(markdown: string) {
  return markdown
    .split(/^(?=## )/m)
    .map((section) => {
      const heading = headingOf(section)
      if (SIDE_COLUMN_SECTIONS.includes(heading)) return ''
      if (heading === PROFILE_HEADING) {
        return stripProfileFieldsShownAbove(section)
      }
      return section
    })
    .join('')
    .trim()
}

function CorrectionLink({ company }: { company: Company }) {
  const title = `Correction: ${company.name} (${company.slug})`
  const body = `Page: https://labs.nusx.edu.sg/hermenaut/c/${company.slug}/\n\nWhat is wrong, and a source for the correct fact:\n`
  const issueUrl = `${REPOSITORY_URL}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`

  return (
    <p className="border-rule text-ink-2 border-t pt-4 text-sm">
      Spotted something wrong?{' '}
      <a
        href={issueUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="text-link hover:text-ink font-semibold underline underline-offset-[0.2em]"
      >
        Report a correction on GitHub
      </a>
    </p>
  )
}
