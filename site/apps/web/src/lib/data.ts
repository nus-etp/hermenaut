import briefsJson from '~/data/briefs.generated.json'
import companiesJson from '~/data/companies.generated.json'
import digestsJson from '~/data/digests.generated.json'
import editionsJson from '~/data/editions.generated.json'
import fundingJson from '~/data/funding.generated.json'
import metaJson from '~/data/meta.generated.json'
import metricsJson from '~/data/metrics.generated.json'
import sourcesJson from '~/data/sources.generated.json'

export {
  UNCLASSIFIED_SECTOR,
  matchesSectorTags,
  sectorBucketsOf,
} from './sectors'

export interface Company {
  slug: string
  name: string
  aliases: string[]
  description: string
  affiliations: string[]
  hasBrief: boolean
  sector?: string
  sectorTags: string[]
  region?: string
  regionFull?: string
  thesis?: string
  sourceTypes: string[]
  fundingStages: string[]
  latestFundingDate?: string
  latestFundingStage?: string
  latestSignalDate?: string
  movedInLatestEdition: boolean
  lastUpdated?: string
  hasInfographic: boolean
  identifiers: {
    linkedin?: string
    crunchbase?: string
    uen?: string
    website?: string
  }
  fundingRoundsCount: number
}

export interface FundingRound {
  date?: string | null
  stage?: string | null
  amount?: string | null
  amount_usd?: number | null
  lead_investors?: string[] | null
  investors?: string[] | null
  source?: string | null
}

export interface SourceLink {
  type: string
  label: string
  url: string
}

export interface Meta {
  generatedAt: string
  totalCompanies: number
  totalBriefs: number
  totalDigests: number
}

export interface CompanyMetrics {
  slug: string
  name: string
  country?: string
  sector?: string
  sectorTags: string[]
  inactive: boolean
  hasBrief: boolean
  fundingUsd?: number
  fundingRounds: number
  latestRoundStage?: string
  latestRoundDate?: string
  jobsOpen?: number
  jobsDelta30?: number
  githubStars?: number
  githubFollowers?: number
  githubRepos?: number
  hn30d?: number
  ambiguousName: boolean
  news7d?: number
  signals90d: number
  ageYears?: number
  registrationDate?: string
  acraStatus?: string
  employees?: string
  employeesFloor?: number
  startupSgStage?: string
  stage?: string
  stageSource?: StageSource
  backers: string[]
  masLicences: string[]
  metricsAsOf?: string
}

export type StageSource = 'funding' | 'startupsg'

export interface MetricsPayload {
  asOf: string
  signalWindowDays: number
  stageOrder: string[]
  companies: CompanyMetrics[]
}

export type SignalType =
  | 'Funding'
  | 'Partnership'
  | 'Patent'
  | 'Tender'
  | 'Filing'
  | 'Release'
  | 'Case study'
  | 'News'
  | 'Hiring'

export interface EditionItem {
  headline: string
  signalType: SignalType
  sourceLabel?: string
  url?: string
}

export interface Mover {
  slug?: string
  name: string
  sector?: string
  sectorTags: string[]
  signalType: SignalType
  headline: string
  sourceLabel?: string
  url?: string
  count: number
  signalTypes: SignalType[]
  items: EditionItem[]
}

export interface Edition {
  date: string
  companiesMoved: number
  signalCount: number
  signalTypeCounts: Partial<Record<SignalType, number>>
  prevDate?: string
  nextDate?: string
  movers: Mover[]
}

export interface SectorTagCount {
  tag: string
  count: number
}

export const companies = companiesJson as Company[]
export const metrics = metricsJson as MetricsPayload
export const briefs = briefsJson as Record<string, string>
export const digests = digestsJson as Record<string, string>
export const fundingRoundsBySlug = fundingJson as unknown as Record<
  string,
  FundingRound[]
>
export const sourcesBySlug = sourcesJson as Record<string, SourceLink[]>
export const meta: Meta = metaJson

function latestOf(dates: (string | undefined)[]) {
  return dates.reduce<string | undefined>(
    (latest, date) => (date && (!latest || date > latest) ? date : latest),
    undefined,
  )
}

export const metricsDataAsOf = latestOf(
  metrics.companies.map((row) => row.metricsAsOf),
)

export const companyBySlug = new Map(companies.map((c) => [c.slug, c]))

export const SECTORS = [
  ...new Set(companies.map((c) => c.sector).filter((s): s is string => !!s)),
].sort()
export const REGIONS = [
  ...new Set(companies.map((c) => c.region).filter((s): s is string => !!s)),
].sort()
export const STAGES = [
  ...new Set(companies.flatMap((c) => c.fundingStages)),
].sort()
export const SOURCE_TYPES = [
  ...new Set(companies.flatMap((c) => c.sourceTypes)),
].sort()

export const digestDates = Object.keys(digests).sort((a, b) => (a < b ? 1 : -1))

const editionsPayload = editionsJson as {
  signalTypes: SignalType[]
  editions: Edition[]
}
const editionsNewestFirst = [...editionsPayload.editions].sort((a, b) =>
  a.date < b.date ? 1 : -1,
)
const editionByDate = new Map(
  editionsNewestFirst.map((edition) => [edition.date, edition]),
)

export const SIGNAL_TYPES = editionsPayload.signalTypes

export function allEditions(): Edition[] {
  return editionsNewestFirst
}

export function latestEdition(): Edition | undefined {
  return editionsNewestFirst[0]
}

export function getEdition(date: string): Edition | undefined {
  return editionByDate.get(date)
}

function countSectorTags(): SectorTagCount[] {
  const counts = new Map<string, number>()
  for (const company of companies) {
    for (const tag of company.sectorTags)
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

export const SECTOR_TAGS = countSectorTags()
export const UNCLASSIFIED_COUNT = companies.filter(
  (company) => company.sectorTags.length === 0,
).length

function orderedMetricStages(): string[] {
  const present = new Set(
    metrics.companies
      .map((row) => row.stage)
      .filter((stage): stage is string => !!stage),
  )
  const known = metrics.stageOrder.filter((stage) => present.has(stage))
  const unknown = [...present]
    .filter((stage) => !metrics.stageOrder.includes(stage))
    .sort()
  return [...known, ...unknown]
}

export const METRIC_STAGES = orderedMetricStages()
