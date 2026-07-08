# MyMazdoorSetu — UI/UX Redesign Specification (v1)

Status: proposed · Author: design pass 2026-07-08 · Follows: UI/UX audit (approved)

## Hard constraints (unchanged by this redesign)

- **Features** — every existing capability stays; nothing is removed or hidden.
- **Routing** — all routes in `App.jsx` keep their paths and semantics.
- **APIs / services** — no service-layer or backend changes are required by this spec.
- **Business logic** — job lifecycle, application rules, intent-gating, role model: untouched.
- **Localization** — the existing `t()` catalog + `LanguageContext` remain the only string
  mechanism. This spec adds no hardcoded strings; where today's pages hardcode English,
  the redesigned page uses catalog keys (content translation is a parallel task).
- **Accessibility** — nothing regresses: `:focus-visible`, `prefers-reduced-motion`,
  `aria-live` toasts, labelled controls all stay; this spec only raises the floor
  (contrast, touch targets, keyboard reach, dialog semantics).

## What this redesign improves

Visual design · layout · modern appearance · user trust · simplicity · mobile experience
· branding. Interaction patterns change **only** where the audit found the pattern itself
misleading (browse-tap-applies, search remount, table actions off-screen) — the underlying
feature and service calls stay identical.

## Performance is a design requirement (approved refinement)

Target device: low-end Android on a slow mobile network. Every phase must **maintain or
improve** bundle size and loading performance. Budget rules:

- **No new JS/UI libraries.** The redesign is CSS tokens + existing components restyled.
- **Fonts:** `display=swap`, Google-subset delivery; Devanagari (Mukta) downloads only when
  Devanagari glyphs render (unicode-range) — English sessions pay ~0 extra.
- **Illustrations:** inline SVG, ≤4KB each, currentColor-driven; no raster images, no CDNs.
- **Animation:** transform/opacity only (no layout thrash); skeletons are pure CSS.
- **CSS growth cap:** each phase adds ≤10KB minified CSS net.
- Route-level code-splitting (React.lazy for the dashboard tree) is noted as a Phase 5
  option — it reduces the public-page bundle without touching behavior.

---

# PART 1 — DESIGN FOUNDATION

## 1.1 Brand direction: “The Work Ledger”

Keep what is already distinctive and double down on it:

- **The ticket** — jobs are physical chits/tickets. Keep the stub + perforation. It is the logo-adjacent signature.
- **Ledger numbers** — tabular mono for every count, wage, rating. Numbers look *recorded*, not decorative.
- **Warm paper + navy ink + amber** — the palette of a site register, not a SaaS gradient.
- **New brand rule (from the contrast fix):** amber surfaces always carry **ink** text, never white.
  This produces a high-visibility “safety-jacket” look (amber + deep navy) that is ownable,
  passes WCAG, and photographs well on cheap screens in sunlight.
- Voice: plain, short sentences, verbs first. Hindi and English are peers, never “Hindi as afterthought”.
- Brand mark: keep `MS` block; corner radius 8; amber block + ink glyph (was white glyph).
- **Scope of the metaphor (approved refinement):** the identity centres on **work and the
  dignity of skilled labour** — the ledger, the ticket, the toolbox — not on construction
  specifically. Construction imagery (scaffold, hard hat) may appear as *one trade among
  several*; never as the brand’s sole visual language. This keeps the door open for
  electricians, drivers, tailors, housekeeping, farm labour, etc. without a rebrand.

## 1.2 Color system (token changes)

All tokens live in `tokens.css`. Changes marked ★.

| Token | Value | Use | Contrast note |
|---|---|---|---|
| `--navy` | `#1B2A4A` | brand dark surfaces, headings | — |
| `--ink` | `#0F1830` | dark chapter bands, text-on-amber ★ | 5.4:1 on amber |
| `--page` | `#FAF8F3` | app background | — |
| `--paper` | `#FFFFFF` | cards | — |
| `--border` / `--border-strong` | `#EAE4D8` / `#D6CDBB` ★ | hairlines | non-text |
| `--text` | `#1B2030` | primary text | 15.7:1 |
| `--text-dim` ★ | `#5A6178` | secondary text ≥13px | 5.9:1 |
| `--text-mute` ★ | `#6E7488` | tertiary text — **min 12px, prefer 14px** | 4.7:1 |
| `--amber` | `#DD7F16` | primary action fill (ink text), accents | text on it = ink only |
| `--amber-dark` ★ | `#9A5A08` | amber **text** on paper/page | 5.5:1 |
| `--amber-light` | `#FCEDDA` | tints, focus ring | non-text |
| `--teal` ★ | `#177865` | success text/icons | 5.4:1 |
| `--teal-light` | `#E0F4EF` | success tint | with `--teal` text |
| `--rose` ★ | `#B03A34` | danger text/fills (white text ok) | 5.6:1 |
| `--rose-light` | `#FAE3E1` | danger tint | with `--rose` text |

New semantic aliases (map to the above; components use only these):
`--action` (amber), `--action-ink` (ink), `--success`, `--danger`, `--info` (navy-light),
`--focus-ring` (unchanged amber ring).

**Rules**
1. White text is allowed only on `--navy`, `--ink`, `--rose`. Never on amber.
2. `--text-mute` never below 12px; at 12px only for UPPERCASE labels (tracking +0.04em).
3. Status is never conveyed by color alone — every pill keeps its dot **and gains an icon or label** (see 2.6).

## 1.3 Typography

**Families**
- Display: `Sora` → falls back to `Mukta` (Devanagari) → sans-serif.
- Body: `Inter` → `Mukta` → sans-serif.
- Mono (ledger numbers): `IBM Plex Mono` (numerals are script-neutral).
- ★ Load `Mukta` wght 400/500/600/700, subsets `devanagari,latin`, `display=swap`.
  This gives Hindi the same weight axis and near-matching x-height instead of OS fallback.

**Scale (tokens; replaces ad-hoc sizes)**

| Token | px | LH | Use |
|---|---|---|---|
| `--fs-display` | 52 (mob 30) | 1.08 | landing hero only |
| `--fs-h1` | 30 (mob 24) | 1.15 | detail-page titles |
| `--fs-h2` | 24 | 1.2 | page heads, section heads |
| `--fs-h3` | 18 | 1.3 | card/section subheads |
| `--fs-h4` | 16 | 1.35 | card titles |
| `--fs-body` | **15** ★ | 1.55 | default body (was 14.5 with much 13) |
| `--fs-sm` | 14 | 1.5 | secondary/meta — **functional floor** |
| `--fs-xs` | 12 | 1.4 | uppercase labels, ticket IDs only |

**Rules:** no inline font sizes — every text style maps to a token. Hindi strings get
`line-height +0.1` headroom (Devanagari ascenders) via the body/display font metrics of Mukta —
no per-string handling. Negative tracking only on Sora ≥18px, never on Devanagari.

## 1.4 Spacing, grid, touch

- **Scale:** `--s1..--s9` = 4, 8, 12, 16, 20, 24, 32, 48, 64. No inline magic margins.
- **Page grid:** public max-width 1180 (unchanged); dashboard main pad `--s6` desktop / `--s4` mobile.
- **Card padding:** `--s5` (20) desktop, `--s4` (16) mobile. Card gap `--s4`.
- **Touch targets ★:** every interactive element ≥ **44×44px** hit area.
  - Buttons: L=52, M=44, S=40 visual + 4px invisible hit padding.
  - Table/list row actions: 44px; chips 40px; switches 44px wide hit area.
- **One-hand rule:** on mobile, the page’s single most important action must sit in the
  bottom 25% of the viewport (sticky bar or bottom-anchored button).

## 1.5 Iconography

- Keep the existing single stroke set (`Icon.jsx`), 2px stroke, round caps.
- Sizes: 16 (inline meta), 20 (buttons, nav), 24 (page-level, empty states).
- ★ Add glyphs: `phone`, `eye`/`eye-off` (password), `menu`, `home`, `alert-triangle`,
  `external`, `filter`, `camera`, `id-card`, `wallet`, `clock`.
- Icons never appear without a text label except: close ✕, notification bell (badged), back arrow.

## 1.6 Illustration system

Style: **flat duotone** — navy line-work + one amber accent fill on paper; geometric,
**work-generic motifs** (toolbox, ledger page, handshake, bridge = “setu”, sunrise shift).
Trade-specific imagery (trowel, wrench, sewing machine) only where a specific trade is the
subject. No 3D blobs, no stock people. Inline SVG, currentColor-driven, ≤4KB each.

| Scene | Used by |
|---|---|
| `empty-jobs` (toolbox + sunrise) | job lists |
| `empty-people` (two silhouettes + handshake) | worker/applicant lists |
| `empty-inbox` (envelope chit) | messages/notifications |
| `empty-search` (magnifier over ticket) | filtered no-results |
| `error-net` (frayed rope bridge) | ErrorState |
| `not-found` (milestone stone “404”) | 404 |
| `soon` (blueprint roll) | Coming-soon pages |
| `hero-site` (existing skyline art, kept) | landing hero |

Empty-state illustration size 96px, decorative (`aria-hidden`), above title.

## 1.7 Motion

Durations/eases from existing tokens (120/180/260ms, standard cubic-bezier). Transform/opacity only.

- Press: scale 0.98 (all buttons/cards). Hover lift: only on elements that **navigate**.
- Enter: lists fade+4px rise, 30ms stagger, first 8 items only.
- Sheets: slide-up 260ms; overlay fade 180ms. Toast: rise+fade.
- Skeleton shimmer stays; disabled under `prefers-reduced-motion` (already).
- **No** hover-lift on non-interactive cards (fixes ProjectCard false affordance).

## 1.8 Elevation & shape

Keep the existing shadow ramp (already tuned to palette). Radius simplifies to 3 steps:
`--r-sm:8` (inputs, chips), `--r-md:12` (cards, buttons), `--r-lg:16` (modals/sheets, hero cards).

---

# PART 2 — CORE COMPONENTS (redesigned once, used everywhere)

## 2.1 Buttons

| Variant | Fill | Text | Border | Use |
|---|---|---|---|---|
| Primary | `--amber` | **`--ink`, 600** | inset seam kept | the one main action per view |
| Secondary | `--paper` | `--navy` | `--border-strong` | alternate actions |
| Ghost | none | `--text-dim` | none | tertiary (logout, cancel) |
| Danger | `--rose-light` → hover `--rose` | `--rose` → white | `--rose` | destructive (withdraw, reject) |

Sizes L/M/S per 1.4. Busy state: inline spinner replaces icon, label persists (“Publishing…” stays).
Full-width on mobile for form submits.

## 2.2 Inputs & fields

- Height 48 (mob) / 44 (desk); radius `--r-sm`; label 14px/600 above; hint 14px `--text-dim` **below the field** (never placeholder-only).
- ★ Phone fields: `type=tel`, numeric keypad, `autocomplete=tel`; passwords get eye toggle + proper `autocomplete`.
- Validation: field-level — 2px `--rose` border + 14px message with `alert-triangle` under the field, `aria-describedby`. Form-level summary only in addition, never alone.
- Required is unmarked; optional fields say “(optional)” — in this product almost everything is required, so mark the exception.

## 2.3 JobTicket 2.0 (signature card)

```
┌───────┬┈┬──────────────────────────────────────┐
│ ₹700– │┊│ Wall plastering, 2BHK flat            │
│ 900   │┊│ ⚲ Saket, Delhi · 5 days · Employer    │
│ /day  │┊│ ★ 4.6 (18)                            │
│ MASON │┊│ [Tools provided] [Meals]     JOB-0412 │
└───────┴┈┴──────────────────────[ View → ]──────┘
```

- **Wage promoted**: stub leads with wage, 18px mono 700 (amber-light text on navy stub); trade drops to 12px uppercase below it.
- Card tap = **open detail. Always.** Button label = “View” (t-key), secondary style.
  Apply never fires from a list. (Feature preserved: applying moves to the detail page the card opens.)
- Min height 112; whole card one link semantically (single tab stop, real `href`).

## 2.4 PersonCard (worker/applicant) & photo policy

- 48px avatar slot: photo when available; otherwise initials on tinted disc (existing tints).
- Line 1: name (16/700 display); line 2: trade · city (14 dim); line 3: ★ rating mono + jobs count; verified chip top-right.
- Same rule: tap opens profile; no terminal actions on cards.

## 2.5 ProjectCard

Non-navigating today → remove hover lift/translate; static informational card with a
“location + openings” emphasis row. If/when a detail page exists it adopts JobTicket interaction.

## 2.6 StatusPill 2.0

Pill keeps tint + dot, adds 12px icon: `check` (accepted/resolved/active/completed),
`clock` (pending/review), `x` (rejected/closed), `arrow` (open). Text from `t()` catalog
(public pages already do this — pills become catalog-driven everywhere; same statuses, same logic).

## 2.7 Responsive list (replaces raw `<table class="list">` on mobile)

- ≥720px: table as today (typography per new scale; actions right-aligned, 44px).
- <720px ★: each row renders as a **stacked row-card**: primary line, meta line,
  status pill, and actions in a visible bottom row — no horizontal scroll, nothing off-screen.
- Row tap opens the related detail (job/worker) where one exists; actions remain buttons.

## 2.8 Modal → Dialog/Sheet

- Desktop: centered dialog (max 560). Mobile ★: bottom sheet, full-width, drag-handle, 16px radius top.
- Semantics: `role=dialog` `aria-modal`, focus moved in on open, trapped, returned on close; Esc closes; overlay click closes **only if form is pristine** — dirty forms ask “Discard?” (visual pattern; no logic change).

## 2.9 Toast 2.0

- Kinds: success (teal icon), info (navy), **error ★: rose fill, white text, `alert-triangle`**.
- Error toasts persist 6s + show ✕ dismiss; success/info stay 3s. `aria-live` unchanged
  (`role=alert` for errors).

## 2.10 EmptyState 2.0

Illustration (1.6) + title (18 display) + hint (15, max 40ch) + action button whose icon
matches the verb (plus for create, `x`/`filter` for clear, `arrow` for navigate). Never promises
un-shipped behavior — copy comes from the catalog and is audited against live features.

## 2.11 Skeletons

Per-layout skeletons replace one-size `PageSkeleton`: `SkeletonTickets` (grid of ticket-shaped
blocks), `SkeletonRows` (list rows), `SkeletonDetail` (title + wage bar + paragraphs),
`SkeletonStats`. **Rule ★: a skeleton may only replace the content region — never the page
header, search bar, or filters the user is interacting with.**

## 2.12 SearchBar 2.0

Input stays mounted at all times (2.11 rule). Debounce ~300ms; spinner inside the field’s
right edge while fetching; result count updates below. Filter chips unchanged visually but
40px tall, with an edge-fade gradient hinting horizontal scroll.

## 2.13 Public chrome

**Header:** brand · links: Jobs, Workers, Projects, How it works ★ (all four; real `<a href>`) ·
lang toggle · Log in · Register. <720px ★: brand + lang + `menu` button opening a sheet with
the four links + auth actions. “How it works” scrolls to `#how-it-works` on the landing page.

**Footer:** as today, plus all `<a>` become real links; static trust lines keep non-link styling.

## 2.14 Dashboard chrome

- **Desktop:** navy sidebar kept; active item = amber fill + **ink** text ★; links become real
  `<a href>` (keyboard-reachable ★). Topbar: brand, notification bell, role switcher,
  **language toggle ★** (strings resolve through the catalog; untranslated keys fall back to
  English automatically), logout.
- **Mobile ★:** sidebar rail is replaced by a **bottom tab bar** — 4 role-specific tabs + “More”:

| Role | Tabs | In “More” sheet |
|---|---|---|
| Worker | Home, Jobs, Applications, Messages | Grievance, Profile |
| Contractor | Home, My jobs, Applicants, Messages | Post, Workers, Payments, Grievance, Profile |
| Employer | Home, Find workers, My jobs, Applications | Post, Saved, Payments, Messages, Grievance, Profile |
| Agent | Home, Workers, Contractors, Commission | Applications, Messages, Profile |
| Admin | Home, Users, Jobs, Verification | Complaints, Logs, Profile |

Tabs: 56px tall, icon 24 + 12px label, active = amber icon + ink label + 2px top indicator.
All routes stay reachable (parity via “More”). Post-a-job also surfaces as a FAB-style primary
button on contractor/employer “My jobs” headers (as today).

## 2.15 Trust kit (cross-cutting) — emphasis raised per approved refinement

**Trust indicators are first-class content, not decoration.** Wherever a person or job is
shown, the applicable signals below appear in a consistent order and style. Honesty rule:
only signals whose data exists today are rendered; future signals ship when their data does.

| Signal | Data source today | Where shown |
|---|---|---|
| ✓ Verified ID (teal shield chip) | `verified` flag | every card, detail header, poster card, applicant row |
| Completed jobs (ledger number) | `jobsDone` | worker cards, worker detail, sticky bars |
| Rating + review count | `rating`, reviews | all cards/details; count always beside stars (a 5.0 from 2 reviews must read differently than from 200) |
| Years of experience | `experienceYears` | worker detail stat band |
| “Reviewed after job” provenance | `review.verified` | review cards |
| Jobs posted / currently hiring | employer profile | employer detail trust panel |
| Member since | *needs backend field* | detail headers — **when data exists** |
| Response time | *needs backend field* | poster card, employer panel — **when data exists** |
| Profile completeness meter | derivable client-side from profile fields | own-profile pages (nudges completion, which itself raises platform trust) |

- **Verified chip** standardized (teal, shield-check) with one tap → plain-language explainer
  popover (“ID checked by MyMazdoorSetu”).
- **Review provenance** line kept (“reviewed after job”) and styled as quiet proof, not badge spam.
- **Demo accounts ★** disappear from the login card; behind a collapsed “Trying the demo?”
  disclosure, rendered only when a dev/demo build flag is on.
- **Sample-data notice** kept, restyled as a slim amber-light banner with `info` icon.
- Logged-in users never see “Register / Log in” banners (banner render is auth-aware ★).
- Every page sets a `document.title` (“Page · MyMazdoorSetu”) and `<html lang>` follows the
  active language ★.

---

# PART 3 — PAGE TEMPLATES

- **T1 Browse** (public lists): section head → SearchBar 2.0 → chip rows → result count → card grid → browse-banner (logged-out only).
- **T2 Detail** (job/worker/employer): back link → identity block → key-fact band → CTA row → content sections (single 640px column) → similar grid → sticky mobile action bar.
- **T3 Console list** (dashboard tables): PageHead (+primary action) → optional stat row → responsive list (2.7) → EmptyState 2.0.
- **T4 Profile**: PageHead → segmented tab row (44px, pill style) → stacked panel cards.
- **T5 Auth card**: centered 420–480px card on calm page background (not `.modal` class), brand mark on top, single column form.

Every page below lists all 13 required aspects; where an aspect equals its template, it says so — that *is* the spec (consistency is the redesign).

---

# PART 4 — PAGE-BY-PAGE SPECIFICATION

## 4.1 Landing `/` (and `/how-it-works`)

- **Goals:** state the promise in one screen; route each audience fast; look credible in Hindi and English; shorten perceived length.
- **Wireframe (mobile, first two screens):**
```
[MS MyMazdoorSetu     हि/EN  ☰]
[audience pills: Worker|Contractor|Employer|Agent]
H1  Kaam dhundo, seedha  (accent)
sub 15px, 2 lines max
[■■ Primary CTA (52px, full)]
[□ Secondary]
—— preview card (single ticket) ——
trust strip: ✓ Verified IDs · ✓ Grievance desk · ✓ No fee for workers
```
- **Layout:** hero (preview card *below* text on mobile ★, beside on desktop); chapter order tightened: Hero → Why (3 rows) → How it works (per-audience) → Featured workers → Latest jobs → Projects → Identity (dark) → Trust → 3 personas **collapsed into one tabbed persona section ★** (same content, switched by the audience pill — removes ~2 screens of scroll) → FAQ → Final CTA (dark) → Footer.
- **Components:** AudienceSwitcher (44px pills), JobTicket 2.0, PersonCard, ProjectCard (static), PrincipleRow, IdentityPillar, FAQ accordion, trust strip ★.
- **Spacing:** sections `--s8` desktop / `--s6` mobile; chapter bands keep alternation.
- **Colors:** unchanged palette; dark chapters `--ink`; all CTAs amber/ink.
- **Typography:** H1 `--fs-display`; section heads `--fs-h2`; body `--fs-body`; Hindi via Mukta.
- **Icons:** existing set; audience pills gain role icons at 16.
- **Illustrations:** keep hero skyline; no new art elsewhere (cards are the proof).
- **Animations:** hero preview cross-fades 180ms on audience change; section reveal none (fast paint priority).
- **Empty states:** featured/jobs sections hide entirely when service returns none (no empty boxes on marketing page).
- **Loading states:** above-fold static; card sections use SkeletonTickets in-place.
- **CTA hierarchy:** 1 primary (audience CTA) · secondary outline · all section CTAs outline; final CTA role cards remain but worker card copy says “Browse jobs” ★ (label matches behavior).

## 4.2 Jobs Browse `/jobs` — template T1

- **Goals:** find a relevant job in <30s on a phone; never lose typing focus.
- **Wireframe:**
```
Browse jobs (h2)
[🔍  input………………………… ◌]
(trade chips →)(city chips →)
n results
[ticket][ticket]…      ← 1-col mobile
[logged-out banner]
```
- **Layout:** T1; ticket grid 2-col ≥880, 1-col below.
- **Components:** SearchBar 2.0 (debounced, spinner-in-field), FilterChips (edge fade), JobTicket 2.0, EmptyState 2.0, ErrorState.
- **Spacing:** search→chips `--s3`; chips→count `--s3`; grid gap `--s4`.
- **Colors/Typography/Icons:** foundation defaults; count line `--fs-sm` dim.
- **Illustrations:** `empty-search` (filtered) / `empty-jobs` (no jobs).
- **Animations:** result grid fade-rise on data change; chip press scale.
- **Empty states:** filtered → “No matches” + **Clear filters** (filter icon); unfiltered → “No jobs yet” + Register.
- **Loading states ★:** only the results region swaps to SkeletonTickets; header/search/chips stay mounted.
- **CTA hierarchy:** card “View” secondary; page has no primary button; banner primary = Register (logged-out only).

## 4.3 Job Detail `/jobs/:id` — template T2

- **Goals:** wage, place, poster, and one decisive Apply within one mobile screen; make the poster feel accountable.
- **Wireframe (mobile):**
```
← Back to jobs
MASON (12 uppercase)
H1 Wall plastering, 2BHK flat
⚲ Saket, Delhi · 5 days · JOB-0412
┌─────────────────────────────┐
│ WAGE   ₹700–900/day (22 mono)│  navy band
└─────────────────────────────┘
[◯ Poster name  ✓Verified ★4.6] → employer page
Hiring 3 workers
[Description][Requirements ✓✓][Facilities]
Posted 2 days ago
— similar jobs —
▓ sticky: ₹700–900/day   [Apply now] ▓
```
- **Layout:** T2 single 640 column; CTA row (desktop) directly under poster card.
- **Components:** wage band, poster card (real link semantics when clickable, chevron affordance ★), checklist, facility chips, AppStatusPill, JobTicket grid, sticky bar.
- **Spacing:** sections `--s6`; wage band pad `--s4/--s5`.
- **Colors:** wage band navy w/ amber-light numerals; facilities teal tint; status pills per 2.6.
- **Typography:** H1 `--fs-h1`; wage 22 mono 700; body 15.
- **Icons:** map, check, share, per-facility set (existing mapping).
- **Illustrations:** none (real data page).
- **Animations:** sticky bar slides up on scroll-past-CTA; apply button busy spinner.
- **Empty states:** not-found → EmptyState 2.0 `empty-search` + “Browse jobs”.
- **Loading states:** SkeletonDetail (title/band/paragraph shapes).
- **CTA hierarchy:** Apply = the page’s only primary; Withdraw = danger-quiet; Share = ghost w/ icon; banner only when logged out ★.

## 4.4 Workers Browse `/workers` — template T1

- **Goals/Wireframe/Layout:** as 4.2 with PersonCards (grid 4/2/1) and the two toggle chips (Available now, Verified only) styled as teal filter-toggles, 40px.
- **Components:** SearchBar 2.0, chips, PersonCard, EmptyState, ErrorState.
- **Spacing/Colors/Typography/Icons:** T1 defaults; verified chip teal.
- **Illustrations:** `empty-people` / `empty-search`.
- **Animations:** grid fade-rise; toggle chips get pressed state (aria-pressed kept).
- **Empty states:** filtered → clear-filters action; bare → “No workers yet” (no action).
- **Loading states:** results-region SkeletonRows of card shapes; search stays mounted ★.
- **CTA hierarchy:** cards “View profile” secondary; banner (logged-out) primary Register.

## 4.5 Worker Detail `/workers/:id` — template T2

- **Goals:** hiring-decision proof (rating, jobs, reviews) above the fold; Contact reachable without scroll.
- **Wireframe (mobile):**
```
← Workers
[◯64 photo/initials]  H1 Name ✓
MASON · ⚲ Delhi
★★★★☆ 4.6 · [● Available]
[ 128 jobs | 9 yrs ]  ← ledger band
[Contact worker  ■ primary]   ← moved above skills ★
skills chips · portfolio · rating bars · reviews · languages
▓ sticky: ★4.6 · 128 jobs  [Contact] ▓
```
- **Layout:** T2; CTA promoted above content sections ★ (desktop + mobile).
- **Components:** PersonCard header pattern, avail chip (read-only styling, not a disabled control ★), stat band, RatingBars, review cards, portfolio grid (camera placeholder tiles), sticky bar.
- **Spacing:** identity block `--s5` gaps; sections `--s6`.
- **Colors:** availability teal/amber tints; rating bars amber.
- **Typography:** H1 `--fs-h1`; stats 24 mono.
- **Icons:** map, check, camera (portfolio placeholders ★ instead of file icon).
- **Illustrations:** none.
- **Animations:** rating bars animate width once on load (respects reduced motion).
- **Empty states ★:** reviews empty → proper EmptyState-quiet: “No reviews yet — reviews appear after completed jobs” (replaces the bare “—”).
- **Loading states:** SkeletonDetail w/ avatar circle.
- **CTA hierarchy:** Contact = only primary (both inline and sticky); everything else navigational.

## 4.6 Employer Detail `/employers/:id` — template T2

- **Goals:** answer “will this employer treat me fairly?” with trust panel first.
- **Wireframe:** identity header (org avatar 64, kind chip, ✓) → tagline → **Trust panel** (overall ★ + category rating bars) → jobs-posted / hiring stat band → open-jobs section (ticket grid, anchor target) → reviews → sticky “View open jobs” bar.
- **Layout/Components/Spacing/Colors/Typography/Icons:** T2 + trust panel card (border-strong, `--s5` pad, head row with ledger score).
- **Illustrations:** none.
- **Animations:** smooth-scroll to open jobs (kept); bars animate once.
- **Empty states:** no open jobs → quiet inline empty (“No open jobs right now”) inside section.
- **Loading states:** SkeletonDetail.
- **CTA hierarchy:** primary = View open jobs (scroll); job cards secondary; no register banner when logged in ★.

## 4.7 Projects Browse `/projects` — template T1 (no search)

- **Goals:** make “sample” unmistakable while still selling the vision; stop cards pretending to be links.
- **Wireframe:** section head → SampleDataNotice banner → 2/1-col ProjectCard grid → browse-banner.
- **Layout:** T1 minus search/chips.
- **Components:** ProjectCard (static, 2.5), SampleDataNotice (restyled slim banner), EmptyState.
- **Spacing/Colors/Typography:** T1 defaults; sample banner amber-light + `--amber-dark` text.
- **Icons:** map, users, calendar on meta rows.
- **Illustrations:** `empty-jobs` for empty list.
- **Animations:** none (static cards) ★.
- **Empty states:** as coded, with new visual.
- **Loading states:** static data — none needed.
- **CTA hierarchy:** banner Register primary / Login secondary; strings move to catalog keys ★.

## 4.8 Login `/login` — template T5

- **Goals:** the front door looks like a product, not a dev tool; zero typing friction on phones.
- **Wireframe (mobile):**
```
        [MS]  (brand mark)
      Log in (h2, catalog key ★)
Phone number        [☎ numeric keypad]
Password            [•••••••  👁]
        [Continue ■ 52px full]
      Forgot password? (link → info sheet*)
   ───────────────────────────
   New here? Create an account
   (demo accounts: dev-flag-only disclosure ★)
```
\*Until a reset API exists, the link opens a sheet explaining recovery via support/grievance — honest, no fake flow, and the entry point is designed now.
- **Layout:** T5 centered card 420; page background `--page` with faint hero gradient.
- **Components:** fields per 2.2 (tel keypad, eye toggle ★), primary button, error text field-level.
- **Spacing:** field gap `--s4`; submit `--s5` above.
- **Colors:** card paper on page; error rose.
- **Typography:** labels 14/600, inputs 16 (prevents iOS zoom ★).
- **Icons:** phone, eye/eye-off.
- **Illustrations:** none — speed.
- **Animations:** button busy spinner; error shake **not** used (reduced-motion hostile) — border+message only.
- **Empty states:** n/a.
- **Loading states:** button busy state only.
- **CTA hierarchy:** Continue primary; register link text-level; demo accounts visually demoted to disclosure.

## 4.9 Register `/register` — template T5

- **Goals:** one screen, phone-first, role choice that reads at a glance; bilingual from key one.
- **Wireframe:** name / phone(tel) / city / password(eye) stacked single-column on mobile (2-col ≥720) → “I want to (choose one or more)” as **role tiles**: 2×2 grid, 64px tall, icon + label + check indicator (replaces emoji chips ★) → hint line → Create account (primary full) → login link.
- **Layout:** T5, 480 card.
- **Components:** fields 2.2; role tiles (aria-pressed kept, 44px+); field-level validation ★ (“Phone number is required” under the field).
- **Spacing:** groups `--s5`; tiles gap `--s3`.
- **Colors:** selected tile amber-light + amber border + ink text.
- **Typography:** tile label 15/600; hint 14 dim (visible, not placeholder ★).
- **Icons:** role icons from `ROLE_META` (replacing emoji for brand consistency).
- **Illustrations:** none.
- **Animations:** tile select 120ms tint.
- **Empty states:** n/a.
- **Loading states:** button busy.
- **CTA hierarchy:** Create account sole primary; role tiles are selection, not CTAs.

## 4.10 Role Select `/select-role` — T5 (wide)

- **Goals:** pick a hat in one tap; feel like the same brand as the dashboard it leads to.
- **Wireframe:** h2 “Choose your role” + user’s name line → role cards grid (2-col; 1-col mobile), each 96px row-card: role icon disc (not emoji ★), “Continue as X”, tagline, chevron.
- **Layout/Components/Spacing:** cards per 2.4 conventions; grid gap `--s4`.
- **Colors/Typography/Icons:** icon disc navy→amber on hover; strings via catalog ★.
- **Illustrations:** none. **Animations:** card press scale; hover lift (they navigate).
- **Empty/Loading:** n/a (redirects cover it).
- **CTA hierarchy:** each card equal weight; no page-level primary.

## 4.11 Dashboard Overview `/app/:role/overview` (all 5 roles)

- **Goals ★:** replace the “After beta” dead-end with a **task launcher**: the user’s next action within one thumb-reach; stats stay honest.
- **Wireframe (worker example, mobile):**
```
Namaste, Ramesh (h2) — Worker
[■ Browse nearby jobs]  ← primary task card
[□ My applications (3 pending)]
[□ Complete your profile]
—— Activity ——
[stat][stat][stat][stat]  ← value: “Available after beta” chip (14px, amber-light)
```
- **Layout:** greeting head → 2–3 **action cards** (role-specific: worker = browse/applications/profile; contractor & employer = post a job/applicants·applications/my jobs; agent = registered workers/commission; admin = verification queue/users/complaints) → honest stat row demoted below.
- **Components:** action card (icon disc, title 16, sub 14, chevron; navigates to existing routes — no new features), StatRow (placeholder chip styling instead of fake-looking mute text ★).
- **Spacing:** action cards gap `--s3`; stats `--s6` below.
- **Colors:** first action card amber-tint border (primary task); others paper.
- **Typography:** greeting `--fs-h2`; counts (where a service already returns list lengths on the target pages, show none here — no invented numbers).
- **Icons:** role nav icons reused. **Illustrations:** none.
- **Empty states:** n/a (launcher always has actions).
- **Loading states:** none needed (static config).
- **CTA hierarchy:** top action card = primary visual; stats non-interactive.

## 4.12 Messages `/app/:role/messages` — template T3

- **Goals:** readable thread list; honest sample banner; mobile rows tappable-sized.
- **Wireframe:** PageHead → sample banner → thread rows (avatar 44, name + time, preview ellipsis, unread badge).
- **Layout/Components:** responsive list rows (2.7) — already row-based; row height ≥64.
- **Spacing:** row pad `--s4`; **Colors:** unread badge amber w/ ink text ★.
- **Typography:** name 15/600, preview 14 dim, time `--fs-xs` mute.
- **Icons:** message. **Illustrations:** `empty-inbox`.
- **Animations:** row press feedback.
- **Empty states:** “No conversations yet” + hint (no false promises).
- **Loading states:** SkeletonRows.
- **CTA hierarchy:** none (list only, feature-as-is).

## 4.13 Grievance `/app/:role/grievance` — template T3

- **Goals:** feels like an official desk (trust anchor) even pre-backend.
- **Wireframe:** PageHead (“Grievance” / admin “Complaints”) → sample banner → list (ID mono, type, desc truncated 60ch, date, StatusPill 2.6).
- **Layout/Components/Spacing/Colors/Typography/Icons:** T3 defaults; shield icon in head.
- **Illustrations:** shield-variant of `empty-inbox` for empty.
- **Animations:** template. **Empty states:** “No complaints on file” as coded, new visuals.
- **Loading states:** SkeletonRows. **CTA hierarchy:** none until filing ships (entry point deliberately absent — matches feature set).

## 4.14 Payments `/app/:role/payments` (Soon) & other `Soon` pages

- **Goals:** placeholder that builds confidence instead of apologizing.
- **Wireframe:** PageHead → `soon` illustration → “Payments is coming in a later phase” + one-line what-it-will-do.
- **All other aspects:** template T3 head + EmptyState 2.0 with `soon` art; no CTA; no loading; colors/typography foundation.

## 4.15 Not Found `*` / dashboard `*`

- **Goals:** dead ends route somewhere useful.
- **Wireframe:** `not-found` illustration → “Page not found” → two buttons: Go home (primary) / Browse jobs (secondary); inside dashboard: Overview / Messages.
- **Other aspects:** T5 centering; foundation tokens; fade-in only; no loading.

## 4.16 Worker · Nearby jobs `/app/worker/browse` — T1-in-console

- **Goals ★:** browsing is safe (tap ≠ apply); details reachable; apply is deliberate.
- **Wireframe:** PageHead → ticket grid (JobTicket 2.0, “View” ★) → tap opens `/jobs/:id` (existing public detail route — routing preserved) where Apply lives with its confirm.
- **Layout/Components/Spacing/Colors/Typography/Icons:** T3 + ticket grid.
- **Illustrations:** `empty-jobs`. **Animations:** grid fade-rise.
- **Empty states:** copy corrected to feature-true (“New jobs appear here — check back”) ★.
- **Loading states:** SkeletonTickets. **CTA hierarchy:** cards secondary “View”; page-level none. Apply (the feature) unchanged — it now always runs through Job Detail’s server-confirmed flow.

## 4.17 Worker · My applications `/app/worker/applications` — T3

- **Goals:** status at a glance; job re-readable; withdraw deliberate.
- **Wireframe (mobile row-card):**
```
Wall plastering, 2BHK — JOB-0412   [⏱ Pending]
Applied 2d ago
[View job]        [Withdraw (danger-quiet)]
```
- **Layout:** responsive list 2.7; row links to `/jobs/:id` ★ (existing route).
- **Components:** StatusPill 2.6, danger-quiet Withdraw w/ inline confirm (“Withdraw? Yes/No” swap-in — visual pattern, same service call).
- **Spacing/Colors/Typography/Icons:** T3 defaults; withdraw rose.
- **Illustrations:** `empty-search` variant. **Animations:** row busy state (row dims while withdrawing ★).
- **Empty states:** “Nothing yet” + **Browse jobs** action (arrow icon).
- **Loading states:** SkeletonRows. **CTA hierarchy:** View job secondary · Withdraw danger-quiet; no primary.

## 4.18 Worker Profile `/app/worker/profile` — template T4

- **Goals:** honesty (no fake saves ★) and pride (this is their public identity).
- **Wireframe:** PageHead → tabs (Details, Portfolio, Availability, Languages, Reviews) as 44px segmented pills → panel cards.
- **Layout:** T4; Details panel fields per 2.2; **Save button reflects reality ★** — until the save API exists the fields render read-only with a “Editing coming soon” chip (no dishonest toast); Availability keeps its live toggle (real service call).
- **Components:** avail toggle (44px), portfolio grid with camera-tile add slot (disabled state w/ “soon” chip if upload not wired), RatingSummary, ReviewsPanel.
- **Spacing/Colors/Typography/Icons:** T4 defaults; camera icon.
- **Illustrations:** none. **Animations:** tab underline slide 180ms.
- **Empty states:** portfolio empty → camera illustration tile; reviews → quiet empty as 4.5.
- **Loading states:** per-panel SkeletonRows.
- **CTA hierarchy:** availability toggle is the only mutating control → visually primary in its card.

## 4.19 Contractor · My jobs `/app/contractor/jobs` — T3

- **Goals:** title-first scanning; lifecycle actions can’t be fat-fingered.
- **Wireframe (row):** `Title (15/600) · JOB-0412 (12 mono mute)` | trade | StatusPill | actions: Close (danger-quiet w/ inline confirm) / Complete (primary-small).
- **Layout:** responsive list; title before ID ★.
- **Components:** PostJobModal→sheet (4.37), status pills, row busy dim.
- **Spacing/Colors/Typography/Icons:** T3; head action “Post a job” primary M.
- **Illustrations:** `empty-jobs`. **Animations:** template.
- **Empty states:** “No jobs posted yet” + Post a job (plus icon — correct verb).
- **Loading states:** SkeletonRows. **CTA hierarchy:** Post a job page-primary; Complete > Close in visual weight (progressive action leads).

## 4.20 Contractor · Applicants `/app/contractor/applicants` — T3

- **Goals ★:** decide with information: applicant context visible before Accept/Reject.
- **Wireframe (mobile row-card):**
```
◯ Applicant name        [⏱ Pending]
Mason · for JOB-0412 (title if present)
[Accept ■][Reject (danger-quiet)]
```
Row tap → **Applicant sheet**: shows every field the existing payload already carries (name, trade, job, status) + the same Accept/Reject; if a worker id exists in the data, a “View public profile” link to `/workers/:id`. *No new API — the sheet is a presentation of the row.*
- **Layout/Components:** responsive list + sheet 2.8; actions 44px, Accept first, gap `--s3` (mis-tap spacing).
- **Spacing/Colors:** accept amber/ink; reject rose-quiet.
- **Typography/Icons:** T3; check/x icons on the two verbs ★.
- **Illustrations:** `empty-people`. **Animations:** decided row fades to its new status (no jump-cut ★).
- **Empty states:** as coded, new visuals.
- **Loading states:** SkeletonRows; per-row busy dim.
- **CTA hierarchy:** Accept visually > Reject; both < page title in weight (considered action, not urgent).

## 4.21 Contractor · Managed workers `/app/contractor/workers` — T3

- **Goals:** the toggle’s consequence is legible; sample data honest.
- **Wireframe (row):** IdChip | trade | ★rating mono | jobs | switch (44px) with 12px state label under (“Direct on/off”) ★.
- **All other aspects:** T3 defaults; `empty-people`; SkeletonRows; no page CTA; toggle toast unchanged.

## 4.22 Contractor Profile `/app/contractor/profile` — T4

As 4.18 pattern with contractor tabs from `profileTabs.js`; same honesty rule for any unwired save; reviews panel per 2.10.
All 13 aspects: inherit T4/4.18; no deltas beyond tab set.

## 4.23 Employer · Find workers `/app/employer/search` — T3

- **Goals:** dashboards get the same quality of discovery as public browse.
- **Wireframe:** PageHead → responsive list (PersonCard-row: avatar, name, trade, ★, city, “View profile”).
- **Aspects:** T3 defaults; `empty-people`; SkeletonRows; row tap + button both → `/workers/:id` (existing behavior kept); no page primary. (Filters here are a future feature — not added, staying feature-faithful.)

## 4.24 Employer · My jobs `/app/employer/myjobs` — T3

Identical spec to 4.19 (shared pattern), employer strings; PostJobModal `postedAsRole=employer` unchanged.

## 4.25 Employer · Applications `/app/employer/applications` — T3

Identical spec to 4.20 including the applicant sheet; employer wording.

## 4.26 Employer · Saved workers `/app/employer/saved` — T3

- **Goals:** stop instructing users to do something that doesn’t exist.
- **Wireframe:** PageHead → sample banner → rows (IdChip, trade, ★).
- **Empty state copy ★:** “Saved workers will appear here” (bookmarking entry point ships later) — hint no longer references a non-existent control.
- **Other aspects:** T3 defaults; `empty-people`; SkeletonRows; no CTA.

## 4.27 Employer Profile `/app/employer/profile` — T4

As 4.18/4.22 pattern with employer tabs; org identity card at top of Details panel (org avatar, kind chip, verified) for brand-trust continuity with the public employer page.

## 4.28 Agent · Workers registered `/app/agent/registered` — T3

Rows: IdChip | trade | verified pill | jobs (num). All aspects T3 defaults; `empty-people`; SkeletonRows; empty-state action none (registration flow is offline/future); sample banner kept.

## 4.29 Agent · Contractors registered `/app/agent/contractors` — T3

Rows: IdChip+type sub | joined | activity | commission (mono, right). Aspects: T3 defaults; `empty-people`; SkeletonRows; no CTA.

## 4.30 Agent · Commission `/app/agent/commission` — T3 + stats

- **Wireframe:** PageHead → 3 stat cards (₹ mono 26) → breakdown card: explainer line (15, max 60ch) → responsive list (date, user, job, type, ₹, status).
- **Aspects:** T3 + StatRow; ledger numbers amber-dark for totals ★; `empty` rupee illustration variant; SkeletonStats+Rows; no CTA; sample banner.

## 4.31 Agent Profile `/app/agent/profile` — T4

As profile pattern; agent tabs; honesty rule applies.

## 4.32 Admin · Users `/app/admin/users` — T3

Rows: name | roletag(s) | city | status pill. Aspects: T3 defaults; `empty-people`; SkeletonRows; no CTA; sample banner.

## 4.33 Admin · Jobs `/app/admin/jobs` — T3

Rows: title-first ★ (ID mono second), trade, status. Aspects: T3 defaults; `empty-jobs`; SkeletonRows; no CTA.

## 4.34 Admin · Verification queue `/app/admin/verification` — T3

Rows: name | roles | submitted | **Review** (primary-small, id-card icon). Empty: `check`-themed “Nothing pending — all accounts verified” (positive state styling: teal tint title ★). Other aspects T3 defaults.

## 4.35 Admin · Activity logs `/app/admin/logs` — T3

PageHead + EmptyState 2.0 (`soon` art; copy stays feature-true: “events will stream here” only if that is planned — else “No activity to show”). No CTA; no loading (static).

## 4.36 Admin Profile `/app/admin/profile` — T4

Profile pattern, admin tabs; minimal panels as coded.

## 4.37 Post-a-job — overlay (used by 4.19/4.24)

- **Goals:** completable one-handed; nothing lost by a stray tap.
- **Wireframe (mobile bottom sheet):** drag handle → “Post a job” → Title(full) → Trade select → Wage(hint: “e.g. ₹700–900/day”) → Location → Duration → Openings(stepper − 1 + ★, 44px, replaces bare number input) → Description → toggle rows (44px switches) → sticky sheet-footer [Publish job ■ full].
- **Layout:** single column in sheet; desktop dialog keeps 2-col grid.
- **Components:** 2.2 fields with field-level validation ★ (“Title is required” under field), dirty-guard on dismiss (2.8), stepper.
- **Spacing:** fields `--s4`; footer `--s4` pad, top hairline.
- **Colors/Typography/Icons:** foundation; publish amber/ink.
- **Illustrations:** none. **Animations:** sheet slide-up; publish busy spinner.
- **Empty states:** n/a. **Loading states:** button busy only.
- **CTA hierarchy:** Publish sole primary; Close ✕ ghost; overlay-dismiss guarded when dirty.

## 4.38 Global states — ErrorState / SampleDataNotice / Toasts

- ErrorState: `error-net` illustration, “Couldn’t load this”, Retry secondary button (refresh icon) — catalog keys ★.
- SampleDataNotice: slim banner, info icon, amber-light bg, `--amber-dark` text, 14px.
- Toasts per 2.9 (error kind finally distinct ★).

---

# PART 5 — ROLLOUT PLAN (approved order; STOP for review after every phase)

Process rule: each phase ends with a working build presented for review. **No phase begins
until the previous one is approved.** No “big bang” redesign.

1. **Phase 1 — Foundation:** tokens (color/spacing/radius + semantic aliases), typography
   (Mukta Devanagari pairing, type-scale tokens, 15px base), global contrast fixes
   (amber/ink rule, darkened dim/mute/teal/rose), touch-target minimums on shared CSS
   controls, error-toast styling. *Global lift; zero layout moves; landing-specific tokens
   (`--fs-display`, `--fs-h2`) keep current values until Phase 2 touches the landing.*
2. **Phase 2 — Landing page** (4.1): hero, chapter tightening, persona-tab consolidation,
   trust strip, public header/footer chrome (2.13) since the landing carries them.
3. **Phase 3 — Public browse & detail pages** (4.2–4.7): T1/T2 templates, SearchBar 2.0
   (region-only skeletons + debounce), JobTicket 2.0 “View” semantics, sticky bars, trust
   indicator placement per 2.15.
4. **Phase 4 — Shared components:** dialog→sheet with a11y (2.8), responsive list rows (2.7),
   StatusPill 2.6, EmptyState 2.0 + illustrations, skeleton variants (2.11), auth pages
   (T5) which are built entirely from these shared pieces.
5. **Phase 5 — Dashboards:** shell chrome (sidebar real links, bottom tabs, lang toggle,
   titles/`<html lang>`), overview launcher, console pages (T3), profiles (T4), applicant
   sheet, demo-account gating, empty-copy audit. Optional: route-level code splitting.

**Acceptance gates per phase:** WCAG AA contrast on changed surfaces · 44px targets ·
keyboard walk-through of changed screens · Hindi + English screenshot pair on a 360px
viewport · no service-layer diffs · **bundle/CSS size delta reported and within budget (see
Performance section)**.
