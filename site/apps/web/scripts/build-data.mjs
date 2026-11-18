#!/usr/bin/env node
// Reads hermenaut data + signals and emits JSON the Next app can statically
// import. Copies brief infographics into public/ so they're served by the
// static export at /etp-hermes/briefs/<slug>/infographic.png.
import { execFileSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../../../..')
const DATA_DIR = join(REPO_ROOT, 'data')
const SIGNALS_DIR = join(REPO_ROOT, 'signals')
const BRIEFS_DIR = join(SIGNALS_DIR, 'briefs')
const UPDATES_DIR = join(SIGNALS_DIR, 'updates')
const APP_ROOT = resolve(__dirname, '..')
const OUT_DATA_DIR = join(APP_ROOT, 'src/data')
const OUT_PUBLIC_BRIEFS = join(APP_ROOT, 'public/briefs')

mkdirSync(OUT_DATA_DIR, { recursive: true })
mkdirSync(OUT_PUBLIC_BRIEFS, { recursive: true })

const toSlug = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const readUtf8 = (p) => readFileSync(p, 'utf8')

// Last commit time of a file (ISO 8601), the ground truth for "last updated".
// Falls back to filesystem mtime when git isn't available (e.g. shallow/no-git
// build) or the file is untracked.
function lastCommitDate(path) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', path], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    if (out) return out
  } catch {
    // fall through to mtime
  }
  try {
    return statSync(path).mtime.toISOString()
  } catch {
    return undefined
  }
}

// --- Parse LIVING_BRIEF.md ---------------------------------------------------

function sectionBody(md, heading) {
  // Split into level-2 sections. The first chunk is the document head.
  const parts = md.split(/(?=^## )/m)
  const want = heading.toLowerCase()
  for (const part of parts) {
    const head = part.match(/^##\s+(.+)/)
    if (head && head[1].trim().toLowerCase() === want) {
      return part.replace(/^##\s+.+\n?/, '')
    }
  }
  return undefined
}

function toIsoTimestamp(text) {
  const match = text.match(
    /^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/,
  )
  if (!match) return undefined
  const [, date, hours = '00', minutes = '00', seconds = '00'] = match
  const iso = `${date}T${hours}:${minutes}:${seconds}Z`
  return Number.isNaN(Date.parse(iso)) ? undefined : iso
}

function parseBrief(md) {
  const out = {
    sector: undefined,
    region: undefined,
    thesis: undefined,
    lastUpdated: undefined,
    latestSignalDate: undefined,
  }

  const m = md.match(/_Last updated:\s*([^_]+?)_/)
  if (m) out.lastUpdated = toIsoTimestamp(m[1].trim())

  // Most recent dated signal in the brief (Recent + Older sections). Cards tag
  // the company "Signal <date>"; the brief is authoritative for that date since
  // not every signal lands in a signals/updates/ digest (e.g. agent-only finds).
  for (const heading of ['Recent signals', 'Older signals']) {
    const body = sectionBody(md, heading)
    if (!body) continue
    for (const line of body.split('\n')) {
      const d = line.match(/^\s*-\s*\*\*(\d{4}-\d{2}-\d{2})\*\*/)
      if (d && (!out.latestSignalDate || d[1] > out.latestSignalDate)) {
        out.latestSignalDate = d[1]
      }
    }
  }

  const thesisBody = sectionBody(md, 'Thesis')
  if (thesisBody)
    out.thesis = thesisBody
      .trim()
      .split(/\n\s*\n/)[0]
      .trim()

  const profileBody = sectionBody(md, 'Profile')
  if (profileBody) {
    for (const line of profileBody.split('\n')) {
      const sector = line.match(/^\s*-\s*Sector\s*:\s*(.+?)\s*$/i)
      if (sector) out.sector = sector[1].trim()
      const region = line.match(/^\s*-\s*Region\s*:\s*(.+?)\s*$/i)
      if (region) out.region = region[1].trim()
    }
  }
  return out
}

// --- Discover briefs ---------------------------------------------------------

const briefSlugs = new Set()
const briefsByDir = {}
if (existsSync(BRIEFS_DIR)) {
  for (const entry of readdirSync(BRIEFS_DIR)) {
    const p = join(BRIEFS_DIR, entry)
    if (!statSync(p).isDirectory()) continue
    const briefPath = join(p, 'LIVING_BRIEF.md')
    const infoPath = join(p, 'infographic.png')
    if (!existsSync(briefPath)) continue
    const md = readUtf8(briefPath)
    briefsByDir[entry] = {
      slug: entry,
      raw: md,
      parsed: parseBrief(md),
      hasInfographic: existsSync(infoPath),
      lastCommitted: lastCommitDate(briefPath),
    }
    briefSlugs.add(entry)
  }
}

// --- Load companies ----------------------------------------------------------

const companies = JSON.parse(readUtf8(join(DATA_DIR, 'companies.json')))

// --- Load digests + index per company ---------------------------------------

const digestFiles = existsSync(UPDATES_DIR)
  ? readdirSync(UPDATES_DIR).filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
  : []

const digests = {}
for (const f of digestFiles) {
  const date = f.replace(/\.md$/, '')
  digests[date] = readUtf8(join(UPDATES_DIR, f))
}

const sectorTaxonomy = readJsonOr(join(DATA_DIR, 'sectors.json'), [])
const SECTOR_SYNONYMS = {
  'artificial intelligence': 'AI',
  biotech: 'Biotechnology',
  cleantech: 'Climate tech',
  climatetech: 'Climate tech',
  climate: 'Climate tech',
  deeptech: 'Deep tech',
  'ed tech': 'EdTech',
  education: 'EdTech',
  healthtech: 'Digital health',
  'health tech': 'Digital health',
  'med tech': 'MedTech',
  quantum: 'Quantum computing',
  spacetech: 'Space tech',
  'internet of things': 'IoT',
  'extended reality': 'XR',
  'ar/vr': 'XR',
  'agri tech': 'Agritech',
  agtech: 'Agritech',
  'fin tech': 'Fintech',
  cyber: 'Cybersecurity',
}
const SECTOR_SEPARATOR = /\s*(?:\/|&|\+|,|\band\b|\|)\s*/i
const canonicalSectorByKey = new Map(
  sectorTaxonomy.map((tag) => [tag.toLowerCase(), tag]),
)

function canonicalSectorTag(raw) {
  const key = raw.trim().replace(/\s+/g, ' ').toLowerCase()
  if (!key) return undefined
  const synonym = SECTOR_SYNONYMS[key]
  if (synonym) return synonym
  return (
    canonicalSectorByKey.get(key) ??
    raw.trim().charAt(0).toUpperCase() + raw.trim().slice(1)
  )
}

function sectorTagsOf(sector) {
  if (!sector) return []
  const whole =
    canonicalSectorByKey.get(sector.trim().toLowerCase()) ??
    SECTOR_SYNONYMS[sector.trim().toLowerCase()]
  if (whole) return [whole]
  const tags = sector
    .split(SECTOR_SEPARATOR)
    .map(canonicalSectorTag)
    .filter(Boolean)
  return [...new Set(tags)]
}

function companySector(company) {
  return (
    briefsByDir[toSlug(company.name)]?.parsed.sector ??
    company.sector ??
    undefined
  )
}

const companySlugByKey = new Map()
for (const company of companies) {
  const slug = toSlug(company.name)
  const aliases = Array.isArray(company.aliases) ? company.aliases : []
  for (const key of [company.name, ...aliases]) {
    const lowered = String(key).trim().toLowerCase()
    if (lowered && !companySlugByKey.has(lowered))
      companySlugByKey.set(lowered, slug)
    const keySlug = toSlug(key)
    if (keySlug && !companySlugByKey.has(keySlug))
      companySlugByKey.set(keySlug, slug)
  }
}
const companyBySlug = new Map(
  companies.map((company) => [toSlug(company.name), company]),
)

const HEADING_PREFIX_MIN_LENGTH = 6

function resolveByNamePrefix(heading) {
  const prefix = `${heading.trim().toLowerCase()} `
  if (prefix.length <= HEADING_PREFIX_MIN_LENGTH) return undefined
  const matches = companies.filter((company) =>
    company.name.toLowerCase().startsWith(prefix),
  )
  return matches.length === 1 ? toSlug(matches[0].name) : undefined
}

function resolveCompanySlug(heading) {
  return (
    companySlugByKey.get(heading.trim().toLowerCase()) ??
    companySlugByKey.get(toSlug(heading)) ??
    resolveByNamePrefix(heading)
  )
}

const DIGEST_HEADING = /^#{2,3}\s+(.+?)\s*$/
const RUN_HEADING = /^run at\b/i
const DIGEST_ITEM = /^\s*-\s+\*\*(.+?)\*\*(?:\s+—\s+(.+?))?\s*$/
const DIGEST_URL = /^\s*<?(https?:\/\/[^\s>]+)>?\s*$/
const SOURCE_PART_SEPARATOR = /\s*·\s*/
const MONTH_NAME =
  /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i
const SOURCE_KIND_LABELS = {
  blog: 'Blog',
  careers: 'Careers',
  github: 'GitHub',
  news: 'News',
  newsroom: 'Newsroom',
  press: 'Press',
}

const SIGNAL_TYPE_RULES = [
  { type: 'Patent', source: /\bipos\b|\bpatent/i, headline: /\bpatent\b/i },
  { type: 'Tender', source: /\bgebiz\b/i, headline: /\btender\b/i },
  {
    type: 'Filing',
    source: /\bedgar\b|\bacra\b|\bmas\b|\bfid\b|\bstartup ?sg\b|\bfiling\b/i,
    headline: /\bform d\b|\bs-1\b|\bf-1\b|\bmas licen[cs]e\b/i,
  },
  {
    type: 'Hiring',
    source: /\bcareers?\b|\bjobs?\b|\bats\b/i,
    url: /jobs\.lever\.co|jobstreet\.|mycareersfuture\.|greenhouse\.io|ashbyhq\.com|workable\.com|careers\./i,
  },
  {
    type: 'Release',
    source: /\bapp store\b|\bplay store\b/i,
    url: /apps\.apple\.com\/|play\.google\.com\/store\/apps|github\.com\/[^/]+\/[^/]+\/releases/i,
  },
  {
    type: 'Funding',
    headline:
      /\braises?\b|\braised\b|\bfunding\b|\bfundraise|\bseries [a-f]\b|\bpre-series\b|\bpre-seed\b|\bseed round\b|\binvests?\b|\binvestment\b|\bgrant\b|\bbacks\b|\bbacked\b/i,
  },
  {
    type: 'Partnership',
    headline:
      /\bpartner(?:s|ship|ships|ing|ed)?\b|\bcollaborat|\bmou\b|\bmemorandum of understanding\b|\bstrategic agreement\b|\bjoins forces\b|\bteams up\b/i,
  },
  {
    type: 'Case study',
    headline: /\bcase stud(?:y|ies)\b/i,
    url: /\/case-stud(?:y|ies)\//i,
  },
  {
    type: 'News',
    headline:
      /\breleases?\b.*\b(?:report|white ?paper|study|survey|index|research|findings)\b/i,
  },
  {
    type: 'Release',
    headline:
      /\b(?:releases?|released|launch(?:es|ed)?|ships?|updates?)\b.*\bv?\d+\.\d+(?:\.\d+)*\b(?!\s*(?:%|million|billion|bn\b|m\b))/i,
  },
]
const SIGNAL_TYPE_PRIORITY = [
  'Funding',
  'Partnership',
  'Patent',
  'Tender',
  'Filing',
  'Release',
  'Case study',
  'News',
  'Hiring',
]

function signalTypeOf({ headline, source, url }) {
  const bySource = SIGNAL_TYPE_RULES.find((rule) => rule.source?.test(source))
  const byHeadline = SIGNAL_TYPE_RULES.find((rule) =>
    rule.headline?.test(headline),
  )
  const byUrl = SIGNAL_TYPE_RULES.find((rule) => rule.url?.test(url ?? ''))
  return (bySource ?? byHeadline ?? byUrl)?.type ?? 'News'
}

function isDatePart(part) {
  return (
    /^\d{4}-\d{2}-\d{2}/.test(part) ||
    (/\d/.test(part) && MONTH_NAME.test(part))
  )
}

function sourceLabelOf(sourceParts, companyKeys) {
  const parts = [...sourceParts]
  if (parts.length > 1 && isDatePart(parts[parts.length - 1])) parts.pop()
  if (parts.length > 1 && companyKeys.has(parts[0].toLowerCase())) parts.shift()
  const label = parts
    .map((part) =>
      part.replace(/\s*\(data\.gov\.sg\)$/i, '').replace(/\s+sitemap$/i, ''),
    )
    .map((part) => SOURCE_KIND_LABELS[part.toLowerCase()] ?? part)
    .join(' · ')
  return label || undefined
}

function companyKeysFor(heading, slug) {
  const company = slug ? companyBySlug.get(slug) : undefined
  const names = [
    heading,
    company?.name,
    ...(Array.isArray(company?.aliases) ? company.aliases : []),
  ]
  return new Set(
    names.filter(Boolean).map((name) => String(name).toLowerCase()),
  )
}

function parseDigestSections(md) {
  const sections = []
  let current
  let lastItem
  for (const line of md.split('\n')) {
    const heading = line.match(DIGEST_HEADING)
    if (heading) {
      lastItem = undefined
      current = RUN_HEADING.test(heading[1])
        ? undefined
        : { heading: heading[1].trim(), items: [] }
      if (current) sections.push(current)
      continue
    }
    if (!current) continue
    const item = line.match(DIGEST_ITEM)
    if (item) {
      lastItem = {
        headline: item[1].trim(),
        source: (item[2] ?? '').trim(),
        url: undefined,
      }
      current.items.push(lastItem)
      continue
    }
    const url = line.match(DIGEST_URL)
    if (url && lastItem && !lastItem.url) lastItem.url = url[1]
  }
  return sections
}

function bySignalPriority(a, b) {
  return (
    SIGNAL_TYPE_PRIORITY.indexOf(a.signalType) -
    SIGNAL_TYPE_PRIORITY.indexOf(b.signalType)
  )
}

function buildMovers(md) {
  const moversByKey = new Map()
  for (const section of parseDigestSections(md)) {
    if (!section.items.length) continue
    const slug = resolveCompanySlug(section.heading)
    const key = slug ?? `heading:${section.heading.toLowerCase()}`
    const company = slug ? companyBySlug.get(slug) : undefined
    const companyKeys = companyKeysFor(section.heading, slug)
    const mover = moversByKey.get(key) ?? {
      slug,
      name: company?.name ?? section.heading,
      sector: company ? companySector(company) : undefined,
      items: [],
      seen: new Set(),
    }
    moversByKey.set(key, mover)
    for (const item of section.items) {
      const dedupKey = item.url ?? `${item.headline}|${item.source}`
      if (mover.seen.has(dedupKey)) continue
      mover.seen.add(dedupKey)
      const sourceParts = item.source
        .split(SOURCE_PART_SEPARATOR)
        .filter(Boolean)
      mover.items.push({
        headline: item.headline,
        signalType: signalTypeOf(item),
        sourceLabel: sourceLabelOf(sourceParts, companyKeys),
        url: item.url,
      })
    }
  }
  return [...moversByKey.values()]
    .map(({ seen, items, ...mover }) => {
      const lead = [...items].sort(bySignalPriority)[0]
      return {
        ...mover,
        sectorTags: sectorTagsOf(mover.sector),
        signalType: lead.signalType,
        headline: lead.headline,
        sourceLabel: lead.sourceLabel,
        url: lead.url,
        count: items.length,
        signalTypes: [...new Set(items.map((item) => item.signalType))].sort(
          (a, b) =>
            SIGNAL_TYPE_PRIORITY.indexOf(a) - SIGNAL_TYPE_PRIORITY.indexOf(b),
        ),
        items,
      }
    })
    .sort(
      (a, b) =>
        bySignalPriority(a, b) ||
        b.count - a.count ||
        a.name.localeCompare(b.name),
    )
}

const editionDates = Object.keys(digests).sort()
const editions = editionDates.map((date, index) => {
  const movers = buildMovers(digests[date])
  const signalTypeCounts = {}
  for (const mover of movers) {
    for (const item of mover.items)
      signalTypeCounts[item.signalType] =
        (signalTypeCounts[item.signalType] ?? 0) + 1
  }
  return {
    date,
    companiesMoved: movers.length,
    signalCount: movers.reduce((total, mover) => total + mover.count, 0),
    signalTypeCounts,
    prevDate: editionDates[index - 1],
    nextDate: editionDates[index + 1],
    movers,
  }
})
const latestEditionRecord = editions[editions.length - 1]
const latestEditionSlugs = new Set(
  (latestEditionRecord?.movers ?? [])
    .map((mover) => mover.slug)
    .filter(Boolean),
)

const latestEditionDateBySlug = {}
for (const edition of editions) {
  for (const mover of edition.movers) {
    if (mover.slug) latestEditionDateBySlug[mover.slug] = edition.date
  }
}

const unlinkedHeadings = [
  ...new Set(
    editions.flatMap((edition) =>
      edition.movers.filter((mover) => !mover.slug).map((mover) => mover.name),
    ),
  ),
]
if (unlinkedHeadings.length) {
  console.warn(
    `[build-data] Digest headings without a matching company: ${unlinkedHeadings.join(', ')}`,
  )
}

function laterDate(a, b) {
  if (!a) return b
  if (!b) return a
  return a > b ? a : b
}

// --- Build the normalized records -------------------------------------------

function latestFunding(rounds) {
  if (!Array.isArray(rounds) || rounds.length === 0) return {}
  const dated = rounds.filter((r) => r.date)
  if (dated.length === 0)
    return { latestFundingStage: rounds[rounds.length - 1].stage }
  dated.sort((a, b) => (a.date < b.date ? 1 : -1))
  return {
    latestFundingDate: dated[0].date,
    latestFundingStage: dated[0].stage,
  }
}

const AFFILIATION_UNIT = String.raw`(?:BLOCK71|NUS|The Hangar)[^,.;:]{0,40}?(?:-resident|-listed|-incubated|-affiliated| portfolio| Run \d+)`
const AFFILIATION_PREFIX = new RegExp(
  `^((?:${AFFILIATION_UNIT})(?:,\\s+${AFFILIATION_UNIT})*)\\s+`,
)
const AFFILIATION_SUFFIX =
  /(?:-resident|-listed|-incubated|-affiliated| portfolio)$/
const NAME_LEAD = /^[^.—]{1,40}\s—\s/
const CONTENTLESS_SENTENCE = /^(?:start-?up|venture|company)\.?$/i
const DIRECTIVE_CLAUSE =
  /(?<![-\w])drop\b|\bdistinct from\b|\bmust be excluded\b|\bunless the article\b|\bonly the .+ should match\b/i
const META_CLAUSE =
  /\bgeneric\b|\blimited public(?:-english)? information\b|^critical\b|\bmatched on\b|\bcommon (?:word|acronym|given name)\b|\bnamesakes?\b|\bcollides\b|\bvery short brand\b|\blookalike\b/i
const PIPELINE_ASIDE = /\bfolded here\b|\bwatchlist\b|\baliase?s?\b/i
const CLAUSE_SEPARATOR = /(;\s+|\s+—\s+|:\s+)/

function endsSentence(text, index) {
  const nextChar = text.slice(index + 1).trimStart()[0] ?? ''
  return (
    /[.!?]/.test(text[index]) &&
    /\s/.test(text[index + 1] ?? '') &&
    /[A-Z'"(\d]/.test(nextChar)
  )
}

function splitSentences(text) {
  const sentences = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '(') depth++
    else if (ch === ')') depth = Math.max(0, depth - 1)
    else if (depth === 0 && endsSentence(text, i)) {
      sentences.push(text.slice(start, i + 1).trim())
      start = i + 1
    }
  }
  const tail = text.slice(start).trim()
  if (tail) sentences.push(tail)
  return sentences
}

function isPipelineClause(clause) {
  return DIRECTIVE_CLAUSE.test(clause) || META_CLAUSE.test(clause.trim())
}

function publicSentence(sentence) {
  if (!isPipelineClause(sentence)) return sentence
  const parts = sentence.replace(/[.!?]$/, '').split(CLAUSE_SEPARATOR)
  let kept = ''
  for (let i = 0; i < parts.length; i += 2) {
    if (isPipelineClause(parts[i])) break
    kept += (i ? parts[i - 1] : '') + parts[i]
  }
  return kept.trim() ? `${kept.trim()}.` : undefined
}

function stripAffiliation(sentence) {
  const lead = sentence.match(NAME_LEAD)?.[0] ?? ''
  const rest = sentence.slice(lead.length)
  const match = rest.match(AFFILIATION_PREFIX)
  if (!match) return { sentence, affiliations: [] }
  const affiliations = match[1]
    .split(/,\s+/)
    .map((unit) => unit.replace(AFFILIATION_SUFFIX, '').trim())
  const remainder = rest.slice(match[0].length)
  const body = lead
    ? remainder
    : remainder.charAt(0).toUpperCase() + remainder.slice(1)
  return {
    sentence: CONTENTLESS_SENTENCE.test(body) ? '' : lead + body,
    affiliations,
  }
}

function cleanDescription(text) {
  const withoutAsides = removeParentheticals(String(text ?? ''), (group) =>
    PIPELINE_ASIDE.test(group),
  )
  const sentences = splitSentences(
    withoutAsides.replace(/\s+([.,;])/g, '$1').trim(),
  )
    .map(publicSentence)
    .filter(Boolean)
  if (!sentences.length) return { description: '', affiliations: [] }
  const { sentence, affiliations } = stripAffiliation(sentences[0])
  const description = [sentence, ...sentences.slice(1)]
    .filter(Boolean)
    .join(' ')
  return { description, affiliations }
}

const REGION_SYNONYMS = {
  US: 'United States',
  USA: 'United States',
  UK: 'United Kingdom',
}
const REGION_NOTE =
  /BLOCK71|NUS|-listed|-resident|incubat|spin-?off|soft-landing|—/i
const REGION_MAX_LENGTH = 32

function removeParentheticals(text, shouldRemove) {
  let out = ''
  let depth = 0
  let group = ''
  for (const ch of text) {
    if (ch === '(') depth++
    if (depth > 0) group += ch
    else out += ch
    if (ch === ')' && depth > 0 && --depth === 0) {
      if (!shouldRemove(group)) out += group
      group = ''
    }
  }
  return out + group
}

function cleanRegionFull(raw) {
  if (!raw) return undefined
  const withoutNotes = removeParentheticals(raw, (group) =>
    REGION_NOTE.test(group),
  )
  const cleaned = withoutNotes
    .split(/\s+—\s+/)[0]
    .replace(/\b(US|USA|UK)\b/g, (code) => REGION_SYNONYMS[code])
    .replace(/\s+([,;])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
  return cleaned || undefined
}

function shortRegion(regionFull) {
  if (!regionFull) return undefined
  const head = regionFull.split(/[(/;,]|\s+and\s+/)[0].trim()
  const region = REGION_SYNONYMS[head] ?? head
  return region && region.length <= REGION_MAX_LENGTH ? region : undefined
}

const normalized = []
const slugCollisions = {}
for (const c of companies) {
  const slug = toSlug(c.name)
  if (slugCollisions[slug]) slugCollisions[slug].push(c.name)
  else slugCollisions[slug] = [c.name]

  const sources = Array.isArray(c.sources) ? c.sources : []
  const sourceTypes = [...new Set(sources.map((s) => s.type).filter(Boolean))]
  const stagesRaw = Array.isArray(c.funding_rounds)
    ? c.funding_rounds.map((r) => r.stage).filter(Boolean)
    : []
  const fundingStages = [...new Set(stagesRaw)]
  const { latestFundingDate, latestFundingStage } = latestFunding(
    c.funding_rounds,
  )

  const aliases = Array.isArray(c.aliases) ? c.aliases : []
  const brief = briefsByDir[slug]

  const regionFull =
    cleanRegionFull(brief?.parsed.region) ?? c.country ?? undefined
  const { description, affiliations } = cleanDescription(c.description)

  normalized.push({
    slug,
    name: c.name,
    aliases,
    description,
    affiliations,
    hasBrief: !!brief,
    sector: companySector(c),
    sectorTags: sectorTagsOf(companySector(c)),
    // Backfill region from the company's HQ country when no brief supplies one,
    // so every company is filterable by region (not just the ~14 with briefs).
    region: shortRegion(regionFull) ?? c.country ?? undefined,
    regionFull,
    thesis: brief?.parsed.thesis,
    sourceTypes,
    fundingStages,
    latestFundingDate,
    latestFundingStage,
    latestSignalDate: laterDate(
      brief?.parsed.latestSignalDate,
      latestEditionDateBySlug[slug],
    ),
    movedInLatestEdition: latestEditionSlugs.has(slug),
    lastUpdated: brief
      ? (brief.parsed.lastUpdated ?? brief.lastCommitted)
      : undefined,
    hasInfographic: brief?.hasInfographic ?? false,
    identifiers: c.identifiers ?? {},
    fundingRoundsCount: stagesRaw.length,
  })
}

const collisions = Object.entries(slugCollisions).filter(
  ([, names]) => names.length > 1,
)
if (collisions.length) {
  console.warn(`[build-data] Slug collisions (${collisions.length}):`)
  for (const [slug, names] of collisions)
    console.warn(`  ${slug} <- ${names.join(', ')}`)
}

// --- Warn on unmatched brief dirs -------------------------------------------

const normalizedSlugs = new Set(normalized.map((n) => n.slug))
const orphanBriefs = [...briefSlugs].filter((s) => !normalizedSlugs.has(s))
if (orphanBriefs.length) {
  console.warn(
    `[build-data] Brief directories without a matching company: ${orphanBriefs.join(', ')}`,
  )
}

// --- Build full-detail brief payload ----------------------------------------

const briefsOut = {}
for (const slug of briefSlugs) {
  briefsOut[slug] = briefsByDir[slug].raw
}

// --- Copy infographics ------------------------------------------------------

for (const slug of briefSlugs) {
  if (!briefsByDir[slug].hasInfographic) continue
  const src = join(BRIEFS_DIR, slug, 'infographic.png')
  const dstDir = join(OUT_PUBLIC_BRIEFS, slug)
  mkdirSync(dstDir, { recursive: true })
  copyFileSync(src, join(dstDir, 'infographic.png'))
}

// --- Build sorted full-funding payload (per-company rounds) ----------------

const fundingOut = {}
for (const c of companies) {
  const slug = toSlug(c.name)
  if (Array.isArray(c.funding_rounds) && c.funding_rounds.length) {
    fundingOut[slug] = c.funding_rounds
  }
}

// --- Build sources payload --------------------------------------------------

const sourcesOut = {}
for (const c of companies) {
  const slug = toSlug(c.name)
  if (Array.isArray(c.sources) && c.sources.length) {
    sourcesOut[slug] = c.sources
  }
}

// --- Build public-metrics payload -------------------------------------------

const METRICS_DIR = join(DATA_DIR, 'metrics')
const SIGNAL_WINDOW_DAYS = 90
const JOBS_DELTA_DAYS = 30
const buildDate = new Date().toISOString().slice(0, 10)

function readJsonOr(path, fallback) {
  try {
    return JSON.parse(readUtf8(path))
  } catch {
    return fallback
  }
}

function readMetricRows(slug) {
  const path = join(METRICS_DIR, `${slug}.jsonl`)
  if (!existsSync(path)) return []
  return readUtf8(path)
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      try {
        return JSON.parse(line)
      } catch {
        return undefined
      }
    })
    .filter((row) => row && row.date)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
}

function readPath(row, path) {
  let value = row
  for (const key of path) {
    if (value == null || typeof value !== 'object') return undefined
    value = value[key]
  }
  return typeof value === 'number' ? value : undefined
}

function latestMetric(rows, paths) {
  for (let i = rows.length - 1; i >= 0; i--) {
    for (const path of paths) {
      const value = readPath(rows[i], path)
      if (value !== undefined) return { value, date: rows[i].date }
    }
  }
  return undefined
}

function metricOnOrBefore(rows, paths, date) {
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].date > date) continue
    for (const path of paths) {
      const value = readPath(rows[i], path)
      if (value !== undefined) return value
    }
  }
  return undefined
}

function shiftDate(date, days) {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n') {
      row.push(field.replace(/\r$/, ''))
      rows.push(row)
      row = []
      field = ''
    } else field += ch
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  const [header, ...body] = rows
  return body
    .filter((r) => r.length === header.length)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])))
}

function loadAcraByCompany() {
  const path = join(DATA_DIR, 'acra', 'watchlist-entities.csv')
  if (!existsSync(path)) return {}
  const rank = (row) =>
    (row.match === 'uen' ? 0 : 1) + (/^live/i.test(row.entity_status) ? 0 : 2)
  const byCompany = {}
  for (const row of parseCsv(readUtf8(path))) {
    const current = byCompany[row.matched_company]
    if (!current || rank(row) < rank(current))
      byCompany[row.matched_company] = row
  }
  return byCompany
}

function loadBackersByCompany() {
  const dir = join(DATA_DIR, 'portfolio-lists')
  const byCompany = {}
  if (!existsSync(dir)) return byCompany
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const list = readJsonOr(join(dir, file), {})
    for (const name of list.companies ?? []) {
      ;(byCompany[name] ??= []).push(list.investor)
    }
  }
  return byCompany
}

function countRecentSignals(md, sinceDate) {
  let count = 0
  for (const heading of ['Recent signals', 'Older signals']) {
    const body = sectionBody(md, heading)
    if (!body) continue
    for (const line of body.split('\n')) {
      const d = line.match(/^\s*-\s*\*\*(\d{4}-\d{2}-\d{2})\*\*/)
      if (d && d[1] >= sinceDate) count++
    }
  }
  return count
}

function employeesFloor(range) {
  const m = String(range ?? '').match(/\d+/)
  return m ? Number(m[0]) : undefined
}

function yearsSince(date) {
  if (!date) return undefined
  const ms =
    Date.parse(`${buildDate}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)
  return Number.isFinite(ms)
    ? Math.round((ms / (365.25 * 864e5)) * 10) / 10
    : undefined
}

function loadCommonWords() {
  const path = join(REPO_ROOT, 'scripts', 'entity_terms.py')
  if (!existsSync(path)) return new Set()
  const source = readUtf8(path)
  const words = new Set()
  for (const name of ['_COMMON_ENGLISH', '_GENERIC_BUSINESS']) {
    const m = source.match(
      new RegExp(`^${name}\\s*=\\s*"""([\\s\\S]*?)"""`, 'm'),
    )
    if (m)
      for (const word of m[1].split(/\s+/))
        if (word) words.add(word.toLowerCase())
  }
  return words
}

const WEAK_MAX_LEN = 5
const commonWords = loadCommonWords()

function nameIsAmbiguous(name) {
  const term = String(name).trim().toLowerCase()
  if (/[0-9.]/.test(term) || /\s/.test(term)) return false
  return commonWords.has(term) || term.length <= WEAK_MAX_LEN
}

const acraByCompany = loadAcraByCompany()
const startupSgByCompany =
  readJsonOr(join(DATA_DIR, 'startupsg', 'watchlist-profiles.json'), {})
    .companies ?? {}
const masByCompany =
  readJsonOr(join(DATA_DIR, 'masfid', 'watchlist-licences.json'), {})
    .companies ?? {}
const backersByCompany = loadBackersByCompany()
const signalsSince = shiftDate(buildDate, -SIGNAL_WINDOW_DAYS)

const JOBS_PATHS = [
  ['jobs', 'open'],
  ['lever', 'open'],
]
const STAGE_ORDER = [
  'Grant',
  'Pre-Seed',
  'Seed',
  'Seed extension',
  'Pre-Series A',
  'Series A',
  'Series B',
  'Series C',
  'Series D',
  'Series E',
  'Bridge',
  'Strategic',
]
const canonicalStageByKey = new Map(
  STAGE_ORDER.map((stage) => [stage.toLowerCase(), stage]),
)

function canonicalStage(raw) {
  if (!raw) return undefined
  const trimmed = removeParentheticals(String(raw), () => true)
    .replace(/\s+/g, ' ')
    .trim()
  return (
    canonicalStageByKey.get(trimmed.toLowerCase()) ?? (trimmed || undefined)
  )
}

const metricsOut = companies.map((c) => {
  const slug = toSlug(c.name)
  const rows = readMetricRows(slug)
  const rounds = Array.isArray(c.funding_rounds) ? c.funding_rounds : []
  const disclosed = rounds
    .map((r) => r.amount_usd)
    .filter((v) => typeof v === 'number' && v > 0)
  const { latestFundingDate, latestFundingStage } = latestFunding(rounds)
  const jobs = latestMetric(rows, JOBS_PATHS)
  const jobsBefore = jobs
    ? metricOnOrBefore(rows, JOBS_PATHS, shiftDate(jobs.date, -JOBS_DELTA_DAYS))
    : undefined
  const acra = acraByCompany[c.name]
  const startupSg = startupSgByCompany[c.name]
  const mas = masByCompany[c.name]
  const brief = briefsByDir[slug]

  return {
    slug,
    name: c.name,
    country: c.country ?? undefined,
    sector: companySector(c),
    sectorTags: sectorTagsOf(companySector(c)),
    inactive: c.status === 'inactive',
    hasBrief: !!brief,
    fundingUsd: disclosed.length
      ? disclosed.reduce((a, b) => a + b, 0)
      : undefined,
    fundingRounds: rounds.length,
    latestRoundStage: latestFundingStage ?? undefined,
    latestRoundDate: latestFundingDate ?? undefined,
    jobsOpen: jobs?.value,
    jobsDelta30:
      jobs && jobsBefore !== undefined ? jobs.value - jobsBefore : undefined,
    githubStars: latestMetric(rows, [['github', 'stars']])?.value,
    githubFollowers: latestMetric(rows, [['github', 'followers']])?.value,
    githubRepos: latestMetric(rows, [['github', 'repos']])?.value,
    hn30d: latestMetric(rows, [['hn_30d']])?.value,
    ambiguousName: nameIsAmbiguous(c.name),
    news7d: latestMetric(rows, [['gdelt_7d']])?.value,
    signals90d: brief ? countRecentSignals(brief.raw, signalsSince) : 0,
    ageYears: yearsSince(acra?.registration_date),
    registrationDate: acra?.registration_date || undefined,
    acraStatus: acra?.entity_status || undefined,
    employees: startupSg?.employees || undefined,
    employeesFloor: employeesFloor(startupSg?.employees),
    startupSgStage: startupSg?.stage || undefined,
    stage:
      canonicalStage(latestFundingStage) ?? canonicalStage(startupSg?.stage),
    stageSource: latestFundingStage
      ? 'funding'
      : startupSg?.stage
        ? 'startupsg'
        : undefined,
    backers: backersByCompany[c.name] ?? [],
    masLicences: mas ? Object.keys(mas.licences ?? {}) : [],
    metricsAsOf: rows.length ? rows[rows.length - 1].date : undefined,
  }
})

// --- Write outputs ----------------------------------------------------------

const meta = {
  generatedAt: new Date().toISOString(),
  totalCompanies: normalized.length,
  totalBriefs: briefSlugs.size,
  totalDigests: digestFiles.length,
}

writeFileSync(
  join(OUT_DATA_DIR, 'companies.generated.json'),
  JSON.stringify(normalized),
)
writeFileSync(
  join(OUT_DATA_DIR, 'briefs.generated.json'),
  JSON.stringify(briefsOut),
)
writeFileSync(
  join(OUT_DATA_DIR, 'digests.generated.json'),
  JSON.stringify(digests),
)
writeFileSync(
  join(OUT_DATA_DIR, 'funding.generated.json'),
  JSON.stringify(fundingOut),
)
writeFileSync(
  join(OUT_DATA_DIR, 'sources.generated.json'),
  JSON.stringify(sourcesOut),
)
writeFileSync(join(OUT_DATA_DIR, 'meta.generated.json'), JSON.stringify(meta))
writeFileSync(
  join(OUT_DATA_DIR, 'metrics.generated.json'),
  JSON.stringify({
    asOf: buildDate,
    signalWindowDays: SIGNAL_WINDOW_DAYS,
    stageOrder: STAGE_ORDER,
    companies: metricsOut,
  }),
)
writeFileSync(
  join(OUT_DATA_DIR, 'editions.generated.json'),
  JSON.stringify({ signalTypes: SIGNAL_TYPE_PRIORITY, editions }),
)

console.log(
  `[build-data] ${meta.totalCompanies} companies, ${meta.totalBriefs} briefs, ${meta.totalDigests} digests`,
)
