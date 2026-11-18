---
name: hermenaut
description: A daily market sheet for the NUSX watchlist, inked in the pipeline's field-notebook hand.
colors:
  paper: "#f2e8d3"
  paper-deep: "#ebdfc4"
  field: "#fbf6ea"
  ink: "#1e2b3c"
  ink-2: "#4a5566"
  ink-3: "#555b65"
  rule: "rgba(30, 43, 60, 0.16)"
  rule-strong: "rgba(30, 43, 60, 0.32)"
  wash: "#4f86b8"
  wash-ground: "rgb(216 228 237)"
  link: "#2c5a86"
  tape-mustard: "#e6bd4f"
  tape-blue: "#a9c6e0"
  tape-sage: "#b5cfa6"
  tape-terra: "#e7a98f"
  sage: "#5f9157"
  sage-ink: "#3f6f39"
  terra: "#c8643f"
  terra-ink: "#9a4729"
  stamp: "#a84d2c"
typography:
  wordmark:
    fontFamily: "Playpen Sans, Segoe Print, Bradley Hand, cursive"
    fontSize: "1.625rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  edition-date:
    fontFamily: "Playpen Sans, Segoe Print, Bradley Hand, cursive"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  display:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.375
  body:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "\"tnum\" 1, \"lnum\" 1"
  prose:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
    fontFeature: "\"tnum\" 1, \"lnum\" 1"
  label:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    letterSpacing: "0.07em"
  tape:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: "16px"
    letterSpacing: "0.09em"
  stamp:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: "15px"
    letterSpacing: "0.14em"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.85em"
rounded:
  sm: "2px"
  dot: "9999px"
spacing:
  gutter-phone: "16px"
  gutter: "32px"
  sheet-max: "1440px"
  nav-height: "52px"
  strip-height: "64px"
  filter-rail: "232px"
  rail-gap: "32px"
  head-row: "28px"
  row: "30px"
  touch: "44px"
components:
  tape-mustard:
    backgroundColor: "{colors.tape-mustard}"
    textColor: "{colors.ink}"
    typography: "{typography.tape}"
    padding: "2px 10px"
  tape-blue:
    backgroundColor: "{colors.tape-blue}"
    textColor: "{colors.ink}"
    typography: "{typography.tape}"
    padding: "2px 10px"
  tape-sage:
    backgroundColor: "{colors.tape-sage}"
    textColor: "{colors.ink}"
    typography: "{typography.tape}"
    padding: "2px 10px"
  tape-terra:
    backgroundColor: "{colors.tape-terra}"
    textColor: "{colors.ink}"
    typography: "{typography.tape}"
    padding: "2px 10px"
  stamp:
    textColor: "{colors.stamp}"
    typography: "{typography.stamp}"
    rounded: "{rounded.sm}"
    padding: "0 5px"
  input-search:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "36px"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.field}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  nav-link:
    textColor: "{colors.ink}"
    padding: "0 8px"
    height: "{spacing.nav-height}"
  table-head:
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    padding: "0 10px"
    height: "{spacing.head-row}"
  table-row:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "0 10px"
    height: "{spacing.row}"
  table-row-moved:
    backgroundColor: "{colors.wash-ground}"
    textColor: "{colors.ink}"
    height: "{spacing.row}"
---

# Design System: hermenaut

## Overview

**Creative North Star: "The Daily Market Sheet, Field-Inked"**

Every day is a dated edition of a market sheet. The sheet is warm paper ruled in navy ink: what moved leads, and every company is a one-line listing row. The materials come from the pipeline's own hand-drawn infographics (the field notebook in `signals/briefs/*/infographic.png`): a watercolour blue wash, strips of masking tape in four colours, a rubber stamp for states, and a hand-lettered face reserved for the wordmark and the edition date. Everything else is a workhorse sans set with tabular figures, because the sheet is read as a table.

Density is high and calm. Rows are 30px tall with hairline dividers, header rows sit on a 1.5px ink rule, and the page runs as one strict column grid inside a 1440px sheet. The craft lives in a few tactile marks laid on an otherwise disciplined table: the wash says "moved in this edition", the tape names a section or a signal type, the stamp declares a state. Nothing is hidden silently; missing data is printed as missing.

The world is light-only (`color-scheme: light`). It replaced an earlier dark dev-tool look; the AI-SaaS hero, card mosaics and dark palettes are the rejected references.

**Key Characteristics:**
- Warm paper ground, navy ink, one blue wash; no dark mode.
- Ink-ruled tables with hairline rows as the primary form for every list.
- Masking-tape labels as section headings and signal-type tags, in four fixed colours.
- Rubber stamps only for states (struck off, no brief, pending, no match).
- Hand-lettered Playpen Sans for exactly two things: the wordmark and edition dates.
- Tabular, lining figures everywhere.

## Colors

A warm-paper and navy-ink palette, with one watercolour blue that means "moved" and four muted tape colours that classify.

### Primary
- **Navy Ink** (ink): All primary text, the 1.5px rules under the header and every table head, checkbox accent, caret, and the solid fill of the one primary button. The sheet is printed in this colour.
- **Field-Wash Blue** (wash): The watercolour pigment. It appears as the textured wash behind moved rows and moved brief headers (laid over the pale **Wash Ground**, wash-ground, with the `wash-tile.webp` raster), as the 7px dot beside a moved company's name, and at 32% opacity as the text selection colour.

### Secondary
- **Notebook Link Blue** (link): Inline links, focus outlines (2px, 2px offset), and "Read the full edition" style calls. Hover goes to Navy Ink.
- **Terracotta** (terra): The 3px underline on the active nav item and the 7% tint behind struck-off group rows. **Terracotta Ink** (terra-ink) is the 1.5px strike-through on excluded metric values.
- **Stamp Rust** (stamp): The stamp's border and lettering. Used for nothing else.

### Tertiary
- **Masking Tapes** (tape-mustard, tape-blue, tape-sage, tape-terra): Background of tape labels only. Mustard is the default section tape ("Edition", "Full listing", "Ranking"); blue marks the moved and reading aids ("Today's movers", "What moved", "Latest", "How to read this"); sage and terra classify signal types. A 12% mustard gradient also warms the top of the edition strip.
- **Sage** (sage) / **Sage Ink** (sage-ink): Positive deltas ("2 new" with an up arrow) in Sage Ink.

### Neutral
- **Paper** (paper): Page ground and sticky header background, lifted by a faint 1200x500 radial highlight at top right.
- **Deep Paper** (paper-deep): Hover fill on filter options, inline code background.
- **Field White** (field): Inputs, selects, the mobile filter sheet, the infographic mount and pull-quote card; also the text colour on the ink button.
- **Second Ink** (ink-2): Secondary text, table-head labels, meta lines, pager links.
- **Faint Ink** (ink-3): "No data" markers, filter counts, placeholders, struck-out values.
- **Hairline** (rule) and **Strong Hairline** (rule-strong): Row dividers and section separators; strong hairline for hover underlines on nav and link decorations, and the scrollbar thumb.

### Named Rules
**The Wash Means Moved Rule.** The watercolour wash is applied only to rows, cards and brief headers of companies that moved in the current edition. It is never decoration, never a hover state, never a section background.

**The Wash Re-Inks Rule.** Inside a wash, the secondary inks darken so text keeps its contrast on the blue: ink-2 to #2a3545, ink-3 to #2f3b4c, link to #1f4161, sage-ink to #22451e, terra-ink to #6a2c17, stamp to #6e2d18, and blue tape lightens to #e3eef8 so it still reads as tape on blue. Any new token used inside a wash needs its own override.

**The Signal Tape Map Rule.** Signal types always wear the same tape: Funding, Partnership and Case study are sage; Patent, Filing and Release are blue; Tender and News are mustard; Hiring is terra. The map lives in one place and every surface uses it.

## Typography

**Display Font:** Source Sans 3 (with system-ui, sans-serif), weights 400, 600, 700
**Hand Font:** Playpen Sans 700 (with Segoe Print, Bradley Hand, cursive)
**Label/Mono Font:** system monospace (ui-monospace, SFMono-Regular, Menlo, Consolas) for inline code only

**Character:** A plain, legible newspaper-table sans carries all of the information; a single hand-lettered face writes the name of the sheet and the date of the edition, the way a field notebook is labelled by hand.

### Hierarchy
- **Wordmark** (Playpen 700, 1.625rem desktop / 1.375rem phone, line-height 1, -0.02em): "hermenaut" in lowercase in the header.
- **Edition Date** (Playpen 700, 1.875rem in the strip; 1.5rem and 1.125rem smaller sizes in lists): "Sun 15 Nov 2026".
- **Display** (700, 2.5rem desktop / 2rem phone, leading-tight, -0.01em, balanced): The company name on a living brief.
- **Headline** (700, 2rem, leading-tight): Page titles (About, Metrics, not-found) and markdown H1. Index-level titles such as "All editions" step down to 1.5rem.
- **Title** (700, 1.375rem, leading-snug): Markdown H2 inside briefs and digests, set on a 1.5px ink rule. H3 is 700 at 1.125rem.
- **Body** (400, 14px base, 15px for meta lines and inputs): UI text. Long-form prose is 1.0625rem at 1.65 line-height, capped at 68ch.
- **Label** (700, 11px, 0.07 to 0.08em tracking, uppercase): Table heads, fact labels, filter group names (12px), sidebar section heads (13px).

### Named Rules
**The Two Hands Rule.** Playpen Sans is used for the wordmark and edition dates and nothing else. Headings, numbers, tapes and stamps stay in Source Sans 3.

**The Tabular Everywhere Rule.** The body sets `tabular-nums lining-nums` globally, so every count, date and metric lines up in its column.

**The Missing Is Printed Rule.** An absent value renders as an em-dash plus a short lowercase phrase ("— no data", "— unclassified", "— none on record") in Faint Ink at 12px. Blank cells and invented placeholders are not allowed.

## Layout

One centred sheet, max 90rem (1440px), with a 1rem side gutter on phones and 2rem from 40rem up. Full-bleed bands (the edition strip, moved brief headers) break out of the gutter with negative margins and re-pad to it.

The vertical frame is fixed: a 52px sticky header on a 1.5px ink rule, then a 64px edition strip on a hairline. The directory is a two-column grid from `lg`: a 232px filter rail beside a fluid table column, 32px apart. Living briefs use a 45rem reading column beside an 18 to 24rem side column, 64px apart (96px at `xl`). Tables run 28px header rows and 30px body rows with 10px cell padding, single-line with ellipsis.

On phones the order is movers first, then search, with filters moved into a bottom sheet behind a button; wide tables collapse to stacked lists or scroll inside their own container. Every interactive target is at least 44px tall below the desktop breakpoints, tightening to 26 to 36px only on `lg` and wider.

## Elevation & Depth

The sheet is flat. Depth is conveyed with rules (1.5px ink for structure, hairlines for rows) and with tonal fills (wash, deep paper). Shadows appear only where a physical object is pinned onto the sheet.

### Shadow Vocabulary
- **Pinned print** (`--shadow-md`: `0 2px 4px rgba(30,43,60,.08), 0 6px 16px rgba(30,43,60,.08)`): The infographic mount (Field White, rotated -0.25deg, held by two tape strips) and the mobile filter sheet.
- **Pinned note** (`--shadow-sm`: `0 1px 2px rgba(30,43,60,.08), 0 2px 6px rgba(30,43,60,.06)`): The pull-quote card in markdown (rotated -0.4deg with a mustard tape strip on top).

### Named Rules
**The Pinned Paper Rule.** A shadow means "a separate piece of paper is taped to the sheet". Tables, rows, the header and the edition strip never cast one; elevation is never a hover response.

## Shapes

Corners are nearly square: 2px on inputs, selects, buttons, the mobile filter sheet, inline code and stamps. The only round shape is the 7px moved dot. Tape is rectangular with torn, toothed short ends (a 2px masked comb on the left and right edges) and a slight tilt (-1.4deg). Stamps tilt further (-3deg). Pinned objects tilt a fraction of a degree. Everything else is ruled straight.

## Components

### Tape Label
The world's section heading and classifier. Inline-block, 11px bold uppercase at 0.09em, 2px by 10px padding, coloured fill with a faint top-light gradient, toothed ends, rotated -1.4deg. The tape is the heading itself (an `h2` wraps it) with an optional muted one-line description beside it, never a small label stacked above a separate headline. A small size (10px, 0.07em, 6px padding) is used for signal-type counts in the edition strip. Linked tapes darken slightly (brightness 95%) on hover.

### Stamp
A rubber-stamp state marker: 1.5px Stamp Rust border, 2px radius, 11px bold uppercase at 0.14em, rotated -3deg. Used only for states: STRUCK OFF, NO BRIEF YET, PENDING (infographic not drawn yet), NO MATCH.

### Edition Strip
The 64px band under the header: mustard "Edition" tape, the hand-lettered date, "N companies moved · N signals", a freshness line ("Latest edition · 3 days ago"), signal-type tapes, and a pager (previous/next edition, all editions) on the right. A 12% mustard gradient warms its top.

### Sheet Table
Head cells: 28px, 11px bold uppercase Second Ink on a 1.5px ink bottom rule. Body cells: 30px, hairline bottom rule, 10px horizontal padding, nowrap with ellipsis. Sortable heads underline the active column in ink (1.5px, 4px offset). Moved rows carry the wash; struck-off rows group last behind a 34px terracotta-tinted group row and a stamp.

### Inputs / Fields
- **Style:** Field White fill, 1.5px Navy Ink border, 2px radius, 15px text; 36px tall on desktop, 44px on phones. Selects use a 1px ink border at the same height.
- **Focus:** global 2px Link Blue outline at 2px offset.
- **Placeholder:** Faint Ink at full opacity.

### Buttons
- **Primary:** Navy Ink fill, Field White text, 600 weight 14px, 2px radius, 44px tall, 16px side padding. Used for the phone-only "Show results" in filter sheets.
- **Text links as actions:** most actions are links: semibold Navy Ink or Link Blue, underline at 0.2em offset, hover to the other ink.

### Navigation
Four items (Directory, Today, Metrics, About & method; "About" on phones), 14px semibold Navy Ink, full 52px tall with 3px transparent top and bottom borders. Active item: Terracotta bottom border. Hover: Strong Hairline bottom border. On phones the list scrolls horizontally with the scrollbar hidden, and the watchlist meta line on the right is hidden below `lg`.

### Pinned Infographic
The brief's infographic sits on a Field White mount with 8 to 12px padding, rotated -0.25deg, Pinned print shadow, and two tape strips across its top edge. When Layer 4 has not drawn it, a dashed-hairline band with a PENDING stamp and one line of explanation takes its place.

## Do's and Don'ts

### Do:
- **Do** set every list of companies, editions or metrics as a ruled sheet table: 28px head on a 1.5px ink rule, 30px rows on hairlines.
- **Do** mark a company that moved in the current edition with the wash (row or header) and the 7px Field-Wash Blue dot, and nothing else with them.
- **Do** name sections with a tape label as the heading, mustard by default and blue for movers and reading aids.
- **Do** use the Signal Tape Map for every signal type, everywhere.
- **Do** print missing values as "— no data" in Faint Ink, and stamp states instead of hiding rows.
- **Do** add matching dark overrides for any new secondary ink that can appear inside a wash.
- **Do** keep touch targets at 44px below `lg`.

### Don't:
- **Don't** use Playpen Sans for headings, numbers, labels or body text; it writes the wordmark and edition dates only.
- **Don't** add a dark theme, decorative gradient backgrounds (the paper highlight, strip warmth and the material shading inside tape and wash are the only ones), or a hero section; the rejected references are the AI-SaaS hero, card mosaics and dark dev-tool palettes.
- **Don't** cast shadows on tables, rows, cards or hover states; shadows are for objects pinned to the sheet.
- **Don't** stack a tape or stamp as a small label above a separate headline; the tape is the heading, the stamp is a state.
- **Don't** round corners past 2px or introduce pill shapes other than the moved dot.
- **Don't** use the stamp colour, the terracotta underline or the wash for emphasis or branding.
