# Changelog

MyMazdoorSetu is a labour marketplace connecting Workers, Contractors (ThekeDar), Employers, and Agents across India's construction industry. This document tracks notable changes to the project in human-readable form, grouped by release rather than by commit.

## v0.1.0 – Marketplace Foundation (2026-07-01)

### Overview
The initial build-out of the public-facing marketplace: a React + Vite single-page app with mock-data-backed services, role-based routing for five user types (Worker, Contractor, Employer, Agent, Admin), and a public landing experience that went through several rounds of visual refinement to move it from a generic template feel toward a considered, construction-industry-specific identity.

### Added
- Core app architecture: mock service layer (`services/`), per-role mock data (`data/`), config-driven per-role navigation and dashboards (`config/`), and role-guarded routing (`RequireAuth`, `RoleRoute`).
- Landing page rebuilt with an audience switcher (Worker/Contractor/Employer/Agent) driving the hero heading, description, CTA, and a real product-style preview card in place of empty placeholder art.
- New landing sections: Why MyMazdoorSetu, per-audience How It Works, Featured Workers, Latest Jobs, Construction Projects, Digital Labour Identity, Trust & Safety, dedicated sections for Contractors/Employers/Agents, FAQ, and a final call-to-action.
- New public pages: Browse Workers (`/workers`) and Browse Projects (`/projects`), alongside the existing Browse Jobs (`/jobs`).
- New reusable components: `AudienceSwitcher`, `HeroPreview`, `WorkerShowcaseCard`, `ProjectCard`, `IdentityPillar`, `PrincipleRow`, `FaqAccordion`.
- A site footer (the app previously had none).
- New mock data: construction projects, a featured/all-workers dataset derived from existing user records.
- A "ledger number" typographic treatment — tabular monospace styling for ratings, stats, and counts — as a deliberate, distinctive visual signature.

### Changed
- Hero simplified to a single focal point: removed a redundant badge above the headline, dropped a second overlapping preview card in favor of one confident card, and increased headline size and weight.
- Section backgrounds moved from a single flat tone to an alternating page/paper rhythm, with two deliberately dark "flagship" sections (Digital Labour Identity, Final CTA) for visual weight.
- Base color palette adjusted: warmer paper tone, a dedicated deep-ink tone for dark sections, and a modestly richer accent color.
- Worker/profile cards restructured so hierarchy comes from typography and spacing (name in the display typeface, rating visually emphasized, skills de-emphasized to plain text) rather than added decoration.
- Icons given a bolder stroke weight; buttons given a hover-lift and more tactile shadow treatment.
- Repetitive bordered "feature cards" (used for abstract points like trust/benefits) replaced with plain typographic rows, reserving card treatment for things that represent a real entity (a worker, a job, a project).

### Fixed
- Avatar initials rendered off-center in an unstyled square wherever they appeared outside one specific wrapper component — a missing base CSS rule, now added so it renders correctly everywhere.
- The audience switcher overflowed off-screen on narrow mobile widths instead of wrapping, caused by a CSS grid sizing default; corrected so it wraps to two rows.
- The hero preview card failed to stack correctly on mobile after a layout change; corrected the flex direction for narrow viewports.
- A floating secondary preview card in the hero was rendered too narrow for its content on the Employer view, breaking its text layout; resized and repositioned.

### Technical Notes
- Per-audience landing copy and navigation are handled as data (config objects keyed by role), rendered by shared components, consistent with the app's existing "differences as data" pattern.
- Later visual changes intentionally touched shared design tokens (color, icon weight) as whole-product identity decisions; dashboard-specific layout and components were left untouched throughout.

### Known Limitations
- Visual and structural work in this phase is scoped to the public site; the authenticated dashboards were not restyled.
- All content is mock/local data; there is no backend.
- Browse pages (Jobs, Workers, Projects) are read-only listings with no search or filtering yet.

---

## v0.2.0 – Localization (2026-07-02)

### Overview
The project had an unused `LanguageContext` stub with no dictionary, no persistence, and zero consumers. This phase turned it into a working English/Hindi localization system and applied it across the landing page, navbar, and footer, establishing the pattern the rest of the app will follow as more screens are localized.

### Added
- A centralized translation system: per-language dictionaries (`src/locales/en.js`, `src/locales/hi.js`) and a small registry describing which languages are available.
- A `t()` translation function on `LanguageContext`, with automatic fallback to English for any key not yet translated, so partial translation work never shows blank text.
- A language toggle in the top navigation bar (public pages), displaying "English" / "हिन्दी".
- Persistence of the selected language in `localStorage`, so it survives a page refresh.
- Full Hindi translation of the landing page, navbar, and footer, plus the job ticket card's interface labels (wage, apply, poster role).

### Changed
- `document.documentElement.lang` now updates automatically whenever the language changes, for accessibility and browser tooling.
- `config/landing.js` restructured from holding literal English copy to holding structure only (icons, ordering, routing); the actual text now lives in the locale dictionaries.
- Job/user-generated mock content (job titles, descriptions, tags) is deliberately left untranslated — only interface labels are translated, keeping a clear line between UI chrome and data.

### Fixed
- Adding the language toggle to the navbar caused it to overflow off-screen on narrow mobile widths; the navbar now wraps to a second row instead of clipping.
- Caught, before it shipped, a regression where removing a hardcoded default button label without also wiring its translated replacement would have rendered a blank "Apply" button on every job card.
- Renamed a loop variable that was shadowing the translation function's name in the job ticket component — hadn't caused a visible bug, but was a landmine for the next change.

### Technical Notes
- Built as a lightweight custom Context + dictionary system rather than an external i18n library, consistent with the project's existing preference for React Context over added dependencies.
- Role labels (`types/roles.js`) were left as plain English, serving as the fallback source for not-yet-localized dashboard screens.

### Known Limitations
- Only English and Hindi are supported; only the landing page, navbar, footer, and job ticket labels are translated.
- Dashboards, auth pages, and the browse pages' own headings/text are not yet localized.
- No general pluralization system — the few cases needing singular/plural handling are handled individually, not through a rules engine.

---

## v0.3.0 – Job Detail (2026-07-02)

### Overview
Job listings previously had no page of their own — every "Apply" click led straight to generic registration with no memory of which job was clicked. This phase added a real Job Detail page, made job cards clickable throughout the site, and enriched the mock job data enough to support a real listing view.

### Added
- A Job Detail page (`/jobs/:id`) showing trade, title, location, duration, wage, the poster's actual name and verification status, a "Hiring N Workers" count, full description, a requirements checklist, facilities shown with small icons, a "posted X days ago" freshness line, similar jobs (same trade), and a register/log-in banner.
- A Share Job action, using the native Web Share API where supported (enabling sharing via WhatsApp and similar apps) and falling back to copy-to-clipboard with a confirmation toast where it isn't.
- New mock data fields on every job listing: description, requirements, posted date, and number of openings.
- A sticky "Apply Now" bar on mobile, keeping the primary action reachable regardless of scroll position.
- Not-found handling for an invalid or removed job ID.

### Changed
- Job cards across the site (landing page, jobs list, similar jobs) are now clickable as a whole, opening the Job Detail page — previously only the small Apply button was interactive.
- "Apply" on job list cards now opens the Job Detail page instead of jumping straight to registration; registration is still where an unauthenticated worker ends up, but only after seeing the full listing.
- The job ticket component gained keyboard accessibility (Enter/Space) now that it's clickable in more places.
- The documented `Job` data shape updated to include the new fields.

### Fixed
- No regressions were found in this sprint; verified via a production build and browser testing across both languages and mobile/desktop breakpoints.

### Technical Notes
- Job Detail is a public route, reachable without logging in, consistent with the rest of the browsable marketplace.
- The poster's name and verification status are resolved by looking up the job's existing poster reference against the mock user records, rather than duplicating that data onto every job.
- Chose a single centered column over a two-column/sidebar layout, favoring a mobile-first, quick-scanning audience over a denser desktop job-board pattern.

### Known Limitations
- Applying while logged out still leads to generic registration; the specific job isn't remembered and resumed afterward.
- The Job Detail page isn't yet linked from the logged-in worker dashboard's own job-browsing screen.
- "Similar jobs" matches by trade only, with no location or wage-range weighting.
- Everything remains mock data with no real backend; the Share action shares whatever URL the app is currently running at.

---

## Upcoming

Planned milestones, not yet started:

- **Resume application after registration** — carry the specific job a worker tapped Apply on through sign-up, landing them back on that job (or a confirmation) instead of a generic post-signup screen.
- **Dashboard localization** — extend English/Hindi translation to the authenticated dashboards, auth pages, and browse-page headings.
- **Dashboard visual pass** — bring the design-system work from v0.1.0 to the authenticated experience, currently untouched.
- **Search and filtering** — for the Jobs, Workers, and Projects browse pages, none of which currently support it.
- **Additional Indian languages** — the localization architecture supports adding a new language in a handful of lines; none beyond Hindi are planned yet.
- **Real backend integration** — replacing the mock service layer with a live API, per the seam already documented in `services/http.js`.
