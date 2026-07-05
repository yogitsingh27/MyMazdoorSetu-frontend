# Beta Readiness Audit

**Date:** 2026-07-05
**Scope:** Full review of the React frontend, ASP.NET Core backend, all `docs/`, every service, every page, routing, authentication, role handling, and API integration.
**Status:** Read-only audit. **No application code was modified.**

**Legend**
- **Severity:** Critical · High · Medium · Low
- **Effort:** S (< half day) · M (half–2 days) · L (> 2 days)
- **Timing:** **Before beta** (blocks a credible beta) · **After beta** (post-launch hardening)

The product is a labour marketplace (Workers, Contractors/ThekeDar, Employers, Agents) with a React 18 + Vite frontend and an ASP.NET Core 8 + EF Core 8 + SQL Server backend. Four Frontend Write Integration phases are complete: auth, apply/withdraw, accept/reject, and job posting/lifecycle. The write path and public read path are genuinely wired to the API; large parts of the dashboards remain on mock data.

---

## SECTION 1 — Features that are fully complete

These are implemented end-to-end (real API, verified in the phase work):

| Area | Detail |
|------|--------|
| **Authentication** | Password login, register→login (201, no auto-token), rotating refresh tokens (httpOnly cookie), logout with server-side revoke, in-memory access token, auto-refresh-on-401, account-status gating, per-IP rate limiting on auth endpoints. |
| **Public reads** | Jobs browse/detail, Workers browse/detail, Employer detail — real API with pagination, filtering, sorting, RFC 7807 ProblemDetails, embedded reviews/similar. Phone numbers are **not** exposed publicly. |
| **Apply / Withdraw** | Worker apply (201 new / 200 reactivation), withdraw, "My applications", server-confirmed CTA state, duplicate (409) and authorization (403) handled, localized (EN/HI) on the public Job Detail. |
| **Accept / Reject** | Employer & Contractor view applicants, accept (decrements openings), reject, ownership enforced from JWT, invalid-transition/duplicate handled. |
| **Job posting & lifecycle** | Create (validated), Close (Open→Closed), Complete (Closed→Completed), "My posted jobs" (role-scoped), functional PostJobModal. |
| **Cross-cutting** | `VITE_USE_API` feature flag, DTO→legacy mappers, Vite dev proxy (first-party refresh cookie), server-confirmed updates, i18n dictionary (en/hi) on public surfaces. |

---

## SECTION 2 — Pages still using mock data

| Page / area | Route | Backing (mock) |
|-------------|-------|----------------|
| Dashboard home (all 5 roles) | `/app/:role/overview` | `*.summary()` — **fabricated** stat numbers |
| Employer "Find workers" | `/app/employer/search` | `EmployerService.findWorkers` → `MANAGED_WORKERS` mock (a real `GET /workers` exists) |
| Employer "Saved workers" | `/app/employer/saved` | mock |
| Contractor "Managed workers" | `/app/contractor/workers` | mock + local toggle state |
| Projects (public + contractor) | `/projects` | `constructionProjects` / `PROJECTS` mock |
| Messages | `/app/:role/messages` | `MessageService` mock |
| Grievance | `/app/:role/grievance` | `ComplaintService` mock |
| Agent (registered workers/contractors, commission) | `/app/agent/*` | `AgentService` mock |
| Admin (users, jobs, verification queue, logs) | `/app/admin/*` | `AdminService` mock |
| Payments | `/app/:role/payments` | "Soon" placeholder |
| Profile self-view (all roles) | `/app/:role/profile` | mock |
| Notifications bell | header | `NotificationService` mock |
| Reviews ("Rate worker/hirer" modals) | applicants / my-jobs / my-apps | `ReviewService.submit` mock (discarded) |
| Worker dashboard summary + availability toggle | `/app/worker/overview` | `WorkerService.summary` / `setAvailability` mock |

**Why it matters:** several of these render **fabricated statistics** (e.g. admin "1,204 users", employer "₹42,000 hiring spend", agent commissions) that look real to a beta user. This both misleads and contradicts the project's "no fabricated statistics" constraint.
**Severity:** Medium (High for the fabricated-stat trust issue) · **Effort:** L overall · **Timing:** see §15 (hide/label fake numbers **before beta**; wire real data **after**).

---

## SECTION 3 — Services still using mock implementations

**Fully mock (no `USE_API` branch):**
`AgentService`, `AdminService`, `NotificationService`, `MessageService`, `ComplaintService`, `ReviewService`.

**Partially mock (API for the write/read paths integrated in phases 1–4; these methods remain mock):**
- `WorkerService` — `summary()`, `setAvailability()`
- `EmployerService` — `findWorkers()`, `savedWorkers()`, `summary()`
- `ContractorService` — `managedWorkers()`, `projects()`, `summary()`, `setWorkerDirectContact()`

**Why it matters:** these are the dashboard reads deliberately deferred during the write-integration milestone. They're clearly marked, but they are the bulk of the "logged-in experience" and are not yet real.
**Severity:** Medium · **Effort:** L · **Timing:** After beta (except fabricated stats — §2).

---

## SECTION 4 — Backend endpoints that exist but are not (fully) exposed in the UI

| Endpoint | Status in UI |
|----------|--------------|
| `GET /api/v1/workers` (search/browse) | Used by the **public** Workers page, but the **Employer "Find workers"** dashboard ignores it and returns mock `MANAGED_WORKERS` regardless of the query. |
| `GET /api/v1/me/posted-jobs` → `applicationCount` / `pendingCount` | Returned but **not displayed**; "My jobs" shows status only. A cheap, valuable signal ("3 new applicants") is dropped. |
| `EmployerDetailDto.currentlyHiring`, worker `languages` | Returned by detail endpoints; only partially surfaced. |

**Why it matters:** the employer search silently returning canned results is misleading in a hiring product; the unused applicant counts are a quick UX win already paid for on the backend.
**Severity:** Medium · **Effort:** S–M · **Timing:** Find-workers fix **before beta** (or label as demo); counts **after beta**.

> Note: all **write** endpoints (create/close/complete/apply/withdraw/accept/reject) are now exposed. The imbalance is the reverse — see §5.

---

## SECTION 5 — Frontend pages that have no backend integration (no endpoint exists)

These surfaces have **no backend at all** — not just mock services, but no controller/entity/flow to wire to:

| Surface | Backend status |
|---------|----------------|
| Messaging | No message entity/endpoint. |
| Notifications | No notification entity/endpoint. |
| **Review submission** | `Review` entity + **read** (embedded in worker/employer detail) exist, but there is **no write endpoint**; "Rate worker/hirer" is a dead-end. |
| Grievance / complaints | No entity/endpoint. |
| Payments | No entity/endpoint (money flows entirely absent). |
| Agent registration & commission | `AgentProfile` exists; no registration/commission endpoints. |
| Admin (users/jobs/verification/logs) | No admin endpoints or authorization surface. |
| **KYC / verification** | `VerificationRecord` entity exists (hash-only, good); no submission/review flow. `IsVerified` is seed-only, so the "Verified" badge is not backed by real verification. |
| Saved / managed workers | No relationship endpoints. |
| Profile editing | No `PUT /me` profile-update endpoint. |

**Why it matters:** these define the gap between "write workflow demo" and "beta product." Most are legitimately post-beta, but **reviews** and **verification badges** touch trust directly.
**Severity:** Medium–High (reviews/verification) · **Effort:** L · **Timing:** mostly After beta; decide reviews/verification honesty **before beta**.

---

## SECTION 6 — Potential bugs

1. **No React ErrorBoundary + unguarded `data.length` on fetch error → white-screen crash.**
   `useServiceData` sets `data = null` on error, but pages (`MyApplicationsPage`, `ApplicantsPage`, `EmployerApplicationsPage`, `JobsBrowse`, etc.) call `apps.length`/`jobs.length` right after the `loading` check with no `error` handling and no top-level ErrorBoundary. Any API/network failure blanks the screen.
   **Severity:** High · **Effort:** M · **Timing:** Before beta.

2. **Fabricated dashboard statistics** (see §2) are shown as if real.
   **Severity:** High (trust) · **Effort:** S to hide · **Timing:** Before beta.

3. **Reviews silently discarded.** `ReviewModal` → `ReviewService.submit` resolves to a fake id; the user believes they rated someone.
   **Severity:** Medium · **Effort:** S (disable) / L (implement) · **Timing:** Before beta (hide) / After (build).

4. **Employer "Find workers" ignores the query** and returns `MANAGED_WORKERS` regardless of trade/filters.
   **Severity:** Medium · **Effort:** S–M · **Timing:** Before beta.

5. **Multi-role session-hint gap.** After login a multi-role user sits on `/select-role` with `activeRole` unset, so nothing is persisted to `localStorage`; a hard navigation/refresh at that moment finds no session hint, skips the refresh probe, and drops the user to `/login` despite a valid refresh cookie. (Discovered during phase testing.)
   **Severity:** Medium · **Effort:** S · **Timing:** Before beta.

6. **`forPoster` N+1 fails whole-list on one error.** `Promise.all` over per-job applicant fetches rejects the entire applicants view if any single job's fetch fails (compounds bug #1).
   **Severity:** Medium · **Effort:** S · **Timing:** Before beta (pair with #1).

7. **Hardcoded review subjects** (`'Ramesh Kumar'`, `'Worker'`, `'Apex Builders'`) in Rate buttons — wrong name attached to a rating.
   **Severity:** Low · **Effort:** S · **Timing:** After beta (moot if reviews hidden).

8. **Dashboards not localized** — the language toggle is intentionally hidden once logged in, so a Hindi user gets an English dashboard.
   **Severity:** Medium · **Effort:** L · **Timing:** After beta (acknowledge before).

---

## SECTION 7 — Race conditions

1. **Job code generation is not atomic.** `GenerateCodeAsync` reads all codes and returns `max+1`. Two concurrent creates compute the same code; the unique index on `Code` saves data integrity but the loser throws → unhandled **500** (no graceful retry).
   **Severity:** Medium · **Effort:** M · **Timing:** Before beta (at least catch→retry) / After (sequence/GUID code).

2. **Openings decrement has no concurrency control.** Two concurrent `accept`s on the same job each read-modify-write `Openings`; no `RowVersion`. Over-acceptance beyond `Openings` is possible (auto-close is intentionally deferred, floored at 0).
   **Severity:** Medium · **Effort:** M · **Timing:** After beta (documented as future optimistic concurrency).

3. **Concurrent refresh across tabs.** The frontend dedups refresh **within one tab** (single in-flight promise), but two tabs hold independent in-memory state. Both can present the same refresh cookie; the backend rotates+revokes on the first, so the second gets 401 and is logged out. No reuse grace window.
   **Severity:** Medium · **Effort:** M · **Timing:** After beta.

4. **No optimistic concurrency (RowVersion) on `Job`/`Application`** generally → lost updates under concurrent edits.
   **Severity:** Low–Medium · **Effort:** M · **Timing:** After beta.

---

## SECTION 8 — Security issues

1. **Production secrets must be provided via environment; verify they are.** Base `appsettings.json` has **no** `Jwt` or connection string (good — forces env config; `Program.cs` throws if `Jwt` missing). But `appsettings.Development.json` **commits a dev JWT key** ("dev-only-…"). Ensure prod uses a strong key from a secret store and that this pattern never leaks a real secret.
   **Severity:** High (if forgotten) · **Effort:** S · **Timing:** Before beta.

2. **Refresh cookie `Secure` depends on `Request.IsHttps`.** Behind a TLS-terminating proxy/load balancer the app often sees `http`, so the cookie won't be marked `Secure` unless `UseForwardedHeaders` (or explicit `Secure=true` in prod) is configured. Risk: refresh token sent over plaintext.
   **Severity:** High · **Effort:** S · **Timing:** Before beta.

3. **Rate limiting only covers auth endpoints.** Write endpoints (create job, apply, accept/reject) and reads are unthrottled → spam/scraping/abuse.
   **Severity:** Medium · **Effort:** M · **Timing:** Before beta (basic global limiter).

4. **No refresh-token reuse detection.** A stolen-then-rotated token is simply rejected; the token family is not revoked, so a thief with an earlier token in the chain isn't cut off proactively.
   **Severity:** Medium–High · **Effort:** M · **Timing:** After beta.

5. **User enumeration on register.** `409 auth.phone_taken` lets an attacker discover which phone numbers are registered. (Login is correctly generic.)
   **Severity:** Low–Medium · **Effort:** S · **Timing:** After beta.

6. **Weak credential policy.** Password only length ≥ 8 (no complexity/breach check); no per-account lockout (only 20/min/IP). Brute force partly mitigated, not fully.
   **Severity:** Medium · **Effort:** M · **Timing:** After beta (consider basic lockout before).

7. **CORS hardcoded to `http://localhost:5173`.** Prod origin must be configured (or rely on same-site + proxy per the integration doc). If misconfigured, either breakage or an over-permissive policy.
   **Severity:** Medium · **Effort:** S · **Timing:** Before beta.

8. **"Verified" badge not backed by real verification** — `IsVerified` is seed-only; no KYC flow. Displaying trust signals without a verification pipeline is a trust/liability risk.
   **Severity:** Medium · **Effort:** L · **Timing:** Before beta (honesty: label/hide) / After (build KYC).

9. **Minor:** no HSTS; no global exception handler (`AddProblemDetails` is registered but `UseExceptionHandler` is not, so unhandled 500s don't return a ProblemDetails body); refresh tokens are never pruned (table growth).
   **Severity:** Low · **Effort:** S each · **Timing:** Before beta (exception handler) / After (rest).

> Good, already in place: access token in memory only; refresh token httpOnly; KYC stored as one-way hash (`VerificationRecord.DocumentHash`); no phone numbers in public read DTOs; identity always derived from JWT `sub`; generic login failure.

---

## SECTION 9 — UX improvements

| Item | Why | Sev | Effort | Timing |
|------|-----|-----|--------|--------|
| Localize dashboards | Hindi users get English once logged in | Med | L | After |
| Replace/hide fabricated stats | Trust; matches "no fabricated data" | High | S | Before |
| Surface applicant counts on "My jobs" | Data already returned; strong signal | Low | S | After |
| Confirm dialog on Close/Complete | Irreversible transitions, no undo | Low | S | After |
| Honest reviews (submit or hide) | Dead-end Rate buttons | Med | S/L | Before/After |
| Show remaining openings on job rows | Accept-decrement is currently invisible | Low | S | After |
| Consistent error surfaces on dashboards | Some dashboards would crash rather than show an error state (§6) | Med | M | Before |

---

## SECTION 10 — Performance improvements

1. **`forPoster` N+1** (1 × `/me/posted-jobs` + 1 per job). Fine for a few jobs; degrades for prolific posters. A dedicated "all applicants for my jobs" endpoint would collapse it. **Sev:** Medium · **Effort:** M (backend) · **Timing:** After beta.
2. **Correlated subqueries per row** for rating/review counts/jobs-done in worker/employer projections → SQL-side N+1. **Sev:** Low–Medium · **Effort:** M · **Timing:** After beta.
3. **No route-based code splitting.** Single JS bundle ~339 KB (~98 KB gzip); grows as dashboards get real. Lazy-load `/app/*`. **Sev:** Medium · **Effort:** M · **Timing:** After beta.
4. **`pageSize=100` browse/search fetches** and **no client caching** (refetch on every navigation). **Sev:** Low · **Effort:** M · **Timing:** After beta.

---

## SECTION 11 — Accessibility improvements

1. **Non-semantic clickables.** `<a className="nav-link" onClick>` (no `href`), brand `<div onClick>`, `back-link` `<a onClick>` — not keyboard-focusable/activatable. **Sev:** Medium · **Effort:** M · **Timing:** Before beta (basic) / After (full).
2. **Unassociated form labels.** `PostJobModal` (and other dashboard forms) use `<label>Text</label><input>` with no `htmlFor`/`id`; screen readers can't pair them. (The auth pages do this correctly.) **Sev:** Medium · **Effort:** S–M · **Timing:** Before beta.
3. **Icon-only controls** (notification bell, availability/contact switches) lack `aria-label`. **Sev:** Medium · **Effort:** S · **Timing:** Before beta.
4. **Modals** (`PostJobModal`, `ReviewModal`) have no focus trap / Escape handling / focus restoration. **Sev:** Medium · **Effort:** M · **Timing:** After beta.
5. **Unaudited contrast & visible focus states.** Needs a pass. **Sev:** Low–Medium · **Effort:** M · **Timing:** After beta.

> Good: `document.documentElement.lang` is synced; toasts use `aria-live="polite"`; several interactive cards already set `role`/`tabIndex`/keydown.

---

## SECTION 12 — Production readiness

| Gap | Why | Sev | Effort | Timing |
|-----|-----|-----|--------|--------|
| **No automated tests** (backend test projects are empty scaffolds; frontend has none) | No regression safety net for auth/ownership/transitions | High | L | Before beta (smoke/critical-path) |
| **No ErrorBoundary** | Any render/fetch error → white screen | High | M | Before |
| **DB migrations not auto-applied** (no `Migrate()`/step) | Fresh prod DB won't have schema | Med | S | Before |
| **No health/readiness endpoint** | Orchestrators/uptime checks can't probe | Med | S | Before |
| **No structured logging / correlation IDs / monitoring** | Blind in production incidents | Med | M | Before (basic) |
| **No global exception handler** | 500s lack a ProblemDetails body; risk of detail leakage | Low–Med | S | Before |
| **Fabricated data in shipped UI** | Trust | High | S | Before |
| **No CI** | Nothing runs build/tests on push | Med | M | Before (build) / After (full) |

---

## SECTION 13 — Deployment readiness

1. **`docs/DEPLOYMENT.md` is empty.** No documented process for building, provisioning, secrets, migrations, or topology. **Sev:** High · **Effort:** M · **Timing:** Before beta.
2. **Frontend is deployable:** `vercel.json` has the SPA rewrite for `BrowserRouter` deep links; `VITE_API_URL`/`VITE_USE_API` are documented in `.env.example`. Needs the prod `VITE_API_URL` and same-site topology (per `FRONTEND_WRITE_INTEGRATION.md`). **Sev:** Low · **Timing:** Before beta (set values).
3. **Backend deployment unspecified:** no Dockerfile/host config; env-based JWT key + connection string not documented as a runbook; `UseForwardedHeaders` needed for correct scheme/`Secure` cookie behind a proxy (ties to §8.2); CORS prod origin; migration application step. **Sev:** High · **Effort:** M–L · **Timing:** Before beta.
4. **Secret provisioning** (JWT key, DB creds) has no documented mechanism. **Sev:** High · **Effort:** S–M · **Timing:** Before beta.

---

## SECTION 14 — Code quality improvements

1. **No linting/tests wired.** `package.json` has only `dev/build/preview` — no ESLint script/config, no test runner. **Sev:** High · **Effort:** M · **Timing:** Before beta (lint+build in CI).
2. **Duplicated pages.** `EmployerApplicationsPage` ≈ `ApplicantsPage`, and `EmployerJobsPage` ≈ `ContractorJobsPage` are near-identical; divergence risk. Extract shared components. **Sev:** Medium · **Effort:** M · **Timing:** After beta.
3. **No TypeScript.** DTO→legacy mapping is the riskiest seam and is untyped (JSDoc only). **Sev:** Medium · **Effort:** L · **Timing:** After beta.
4. **Mock/API branches interleaved** in services — fine transitionally, but tech debt once mock is retired. **Sev:** Low · **Effort:** M · **Timing:** After beta.
5. **Minor:** hardcoded subject names in review buttons; pervasive inline styles/magic numbers. **Sev:** Low · **Effort:** M · **Timing:** After beta.

> Strong points: clean service-layer boundary with role services delegating to generic ones; explicit DTO mappers; feature-folder backend with thin controllers, typed error enums, and `.Select` projections; consistent ProblemDetails; documented milestones.

---

## SECTION 15 — Suggested priorities

### P0 — Before beta (blocks a credible, honest, deployable beta)
1. **Deployment runbook + provisioning** — fill `DEPLOYMENT.md`; env-based JWT key & connection string; migration step; prod `VITE_API_URL`; CORS origin. (§13, §8.1)
2. **Cookie `Secure` behind proxy** — `UseForwardedHeaders`/force Secure in prod. (§8.2)
3. **ErrorBoundary + fetch-error handling** — no white screens; guard `data` before `.length`. (§6.1, §6.6)
4. **Remove/replace fabricated statistics** (and dead-end reviews / query-ignoring employer search) — ship nothing that lies to the user. (§2, §6.2–6.4, §5 reviews/verification honesty)
5. **Basic global rate limiting** on write endpoints. (§8.3)
6. **Health check endpoint + minimal logging + global exception handler.** (§12)
7. **Critical-path smoke tests** (auth, apply, accept, create) + build in CI. (§12, §14.1)
8. **Multi-role session-hint fix** and **job-code create race** (catch→retry). (§6.5, §7.1)
9. **Accessibility baseline** — label association, aria-labels on icon buttons, keyboard-activable nav. (§11.1–11.3)

### P1 — Shortly after beta
- Refresh-token reuse detection; account lockout; enumeration hardening. (§8.4–8.6)
- Optimistic concurrency on Job/Application; cross-tab refresh grace. (§7.2–7.4)
- Wire real dashboard reads (summaries, find/saved/managed workers, posted-job counts). (§2, §3, §4)
- Dashboard localization. (§6.8, §9)
- Route code-splitting; N+1 reductions. (§10)

### P2 — Later
- Real messaging, notifications, payments, agent, admin, KYC/verification flows. (§5)
- Reviews submission end-to-end. (§5)
- TypeScript migration; de-duplicate pages; retire mock branches. (§14)

---

### One-line verdict
The **write workflow and public read path are genuinely production-shaped and well-structured**, but the app is **not yet beta-ready**: it ships fabricated dashboard data and dead-end actions, has **no tests, no ErrorBoundary, and no deployment/secrets story**, and has a few deployment-security gaps (proxy `Secure` cookie, unthrottled writes). The P0 list is small and mostly low-effort — closing it yields an honest, deployable beta without building any of the large post-beta features.

---

# Implementation Plan — Beta Polish milestone

**Scope:** P0 items only (§15). **No new features.** Preserve existing UI and workflows. Focus on stability, reliability, and production readiness. Each phase stops for verification before the next.

Every P0 item maps to exactly one phase:

| P0 # | Item | Phase |
|------|------|-------|
| 2 | Cookie `Secure` behind proxy | 1 |
| 5 | Global rate limiting on writes | 1 |
| 6 | Health check + logging + global exception handler | 1 |
| 8b | Job-code create race (catch→retry) | 1 |
| 1 (config) | Env secrets, CORS from config, migration strategy | 1 |
| 3 | ErrorBoundary + fetch-error handling | 2 |
| 8a | Multi-role session-hint fix | 2 |
| 4 | Fabricated stats / dead-end reviews / find-workers honesty | 3 |
| 9 | Accessibility baseline | 4 |
| 7 | Critical-path smoke tests + CI | 5 |
| 1 (docs) | Deployment runbook | 6 |

### Phase 1 — Backend hardening & security (backend only) — **DONE & verified 2026-07-05**
- **Forwarded headers + Secure cookie:** add `UseForwardedHeaders` so `Request.IsHttps` is accurate behind a TLS-terminating proxy → the existing `Secure = Request.IsHttps` refresh cookie becomes correct in prod (no `AuthController` change needed).
- **Global rate limiting:** add a per-IP fixed-window limiter for authenticated write endpoints (create/apply/withdraw/accept/reject/close/complete), returning the same `429 ProblemDetails` shape as the auth limiter.
- **Global exception handler:** `UseExceptionHandler` emitting RFC 7807 ProblemDetails (no stack traces in prod).
- **Health check:** `AddHealthChecks()` + `AddDbContextCheck` mapped at `/health`.
- **Minimal request logging:** enable built-in HTTP logging (method/path/status/elapsed).
- **Job-code create race:** wrap `CreateAsync` save in a bounded retry that regenerates the code on a unique-constraint violation (graceful, no 500).
- **Config:** CORS origins from configuration (`Cors:Origins`); confirm base `appsettings.json` carries no secrets; add an `appsettings.Production.json` **template** (placeholders only) documenting required env vars; **migration strategy** per decision below.
- *Files:* `Program.cs`, `Features/Jobs/JobWriteService.cs`, `appsettings.json`, new `appsettings.Production.json` (template). No new endpoints exposed beyond `/health`.
- *Verify:* app boots; `/health` 200; write endpoints throttle at the limit; forced exception returns ProblemDetails; concurrent creates don't 500; existing flows unchanged.

### Phase 2 — Frontend resilience (stability) — **DONE & verified 2026-07-05**
- **Global ErrorBoundary** (`src/components/common/ErrorBoundary.jsx`) wrapping the app in `App.jsx`, with a friendly fallback + reload — backstops any render/fetch crash (no more white screens).
- **Fetch-error handling:** add a small shared `ErrorState` component and surface `useServiceData`'s `error` in the list pages that currently call `data.length` unguarded, and default `data ?? []` so they never crash. Pages: `WorkerPages` (Browse, MyApplications), `ContractorPages` (Applicants, ContractorJobs), `EmployerPages` (Applications, MyJobs, FindWorkers, SavedWorkers), public `JobsBrowse`/`WorkersBrowse`/`ProjectsBrowse`, `DashboardHome`.
- **Multi-role session-hint fix:** persist a lightweight session hint (the user) at login in `AuthContext` so a hard navigation/refresh from `/select-role` restores the session via the refresh cookie instead of dropping to `/login`.
- *Files:* new `ErrorBoundary.jsx`, new `ErrorState.jsx`, `App.jsx`, `contexts/AuthContext.jsx`, and the listed pages (2-line guards each). `useServiceData.js` unchanged (already returns `error`).
- *Verify:* simulate an API failure → inline error (not a crash); throw in a page → boundary fallback; multi-role login → reload on `/select-role` stays authenticated; all four prior phases still pass.

### Phase 3 — Honesty pass (no fabricated data / dead-ends) — **DONE & verified 2026-07-05**

Implemented: dashboard summary stats (all roles) show honest placeholders ("After beta" + caption) instead of fabricated numbers — the mock `summary()` fetch is dropped entirely. Dead-end **review** actions ("Rate worker"/"Rate hirer") and the fabricated Grievance **submit** are removed. **Find workers** now uses the real `/workers` search (via `WorkerService.search`), shows real data (City column replacing the unavailable "Availability"), and the previously-dead "View profile" button navigates to the worker's page. Every remaining mock feature screen (agent, admin, messages, grievance, saved/managed workers, public projects) now carries a `SampleDataNotice` banner so sample data never masquerades as real. New: `SampleDataNotice.jsx`; `DashboardHome.jsx` rewritten; `EmployerService.findWorkers` API-backed. Verified with 14 UI checks (honest placeholders, no `₹42,000`, no Rate buttons, real Find-workers + navigation, notices on all mock screens, Grievance submit gone).

- **Dashboard statistics:** stop showing invented numbers (approach per decision below).
- **Dead-end reviews:** hide/disable the "Rate worker/hirer" buttons (no review-write endpoint exists) in `WorkerPages`, `ContractorPages`, `EmployerPages`.
- **Employer "Find workers":** make it honest (approach per decision below — wire to the real `GET /workers` search, or clearly label as demo).
- *Files:* `config/dashboards.js`, `pages/shared/DashboardHome.jsx`, role services' `summary()`, `pages/employer/EmployerPages.jsx`, `pages/contractor/ContractorPages.jsx`, `pages/worker/WorkerPages.jsx`, `services/EmployerService.js`.
- *Verify:* no fabricated figures render; no action silently discards; find-workers behaves honestly.

### Phase 4 — Accessibility baseline — **DONE & verified 2026-07-05**

Implemented (no layout changes): non-semantic clickables are now keyboard-operable — the Topbar brand + public nav-links and the three detail-page back-links get `role="button"`, `tabIndex={0}`, and Enter/Space activation via a new `onActivate` helper (`src/utils/a11y.js`). `PostJobModal` form fields are label-associated (`htmlFor`/`id` on all 7), its close button gets `aria-label="Close"`, and its two toggle switches get `aria-label` + `aria-pressed`. The Managed-workers switch gets `aria-label`/`aria-pressed`; the RegisterPage role choices become an `aria`-labelled group. NotificationBell (`aria-label`) and RoleSwitcher (`aria-haspopup`/`expanded`/`listbox`/`option`) were already accessible — left as-is. Modal focus-trap remains deferred to post-beta (§11.4). Verified with 12 checks: keyboard focus + Enter activation of nav-links/brand/back-links, no keyboard trap on landing, all 7 modal labels resolve via `getByLabel`, and toggle/close accessible names + `aria-pressed`.

- **Keyboard-activable nav:** convert `<a onClick>` nav/back links (Topbar, JobDetail back-link) to buttons or add `role`/`tabIndex`/keydown.
- **Label association:** add `htmlFor`/`id` to `PostJobModal` (and any other unassociated dashboard form fields).
- **Icon-only controls:** `aria-label` on the notification bell and toggle switches; `aria-pressed` where appropriate.
- *Files:* `components/layout/Topbar.jsx`, `components/layout/NotificationBell.jsx`, `components/job/PostJobModal.jsx`, `pages/public/JobDetail.jsx`, switch usages (ContractorPages, PostJobModal). Modal focus-trap is explicitly **deferred to after beta** (§11.4).
- *Verify:* keyboard-only pass over the changed controls; labels announced; no visual change.

### Phase 5 — Critical-path tests + CI — **DONE & verified 2026-07-05**

Implemented **backend integration tests** over the real HTTP API (`WebApplicationFactory<Program>`), with only the DB provider swapped for an isolated in-memory store (`ApiFactory`) so the suite runs anywhere including Linux CI — no SQL Server needed. Two high-value tests cover all required workflows: `Auth_Register_Login_Refresh_Works` (register→login→authenticated `/me`→refresh→wrong-password 401) and `HiringWorkflow_Create_Apply_Withdraw_Accept_Reject_Close_Complete` (create → apply ×2 → withdraw → reactivate(200, same id) → duplicate(409) → view applicants → role/ownership guard(403) → accept(openings 2→1) → reject → close → complete). **Frontend CI** = ESLint (`.eslintrc.cjs`, `npm run lint`) + production build. **CI** (`.github/workflows/ci.yml`): frontend job (`npm ci`/lint/build) and backend job (restore/Release build/integration tests). Small enabling changes to `Program.cs`: `public partial class Program`, configurable rate limits (defaults 20/60 unchanged; tests raise them), and a relational-only guard on migrate-on-startup. Verified locally: **2/2 tests pass** (Debug + Release, `--no-build`), lint clean (0 problems), build green, and both CI command sequences run end-to-end.

- **Backend integration tests** (fill the empty `MazdoorSetu.IntegrationTests`) with `WebApplicationFactory` over a test database, covering: register→login→refresh→logout; apply→withdraw→reapply→duplicate(409); accept/reject + ownership(403) + invalid-transition(409); create + validation(400) + close→complete.
- **Frontend:** ESLint config + `lint` script; `build` as the CI gate (frontend unit-test runner per decision below).
- **CI:** `.github/workflows/ci.yml` — frontend `npm ci && lint && build`; backend `dotnet build && dotnet test`.
- *Files:* new tests under `Backend/tests/`, `package.json` (scripts/devDeps), new eslint config, new `.github/workflows/ci.yml`.
- *Verify:* tests pass locally; CI green on a push.

### Phase 6 — Deployment runbook (docs only) — **DONE 2026-07-05**

`docs/DEPLOYMENT.md` completed: all 18 sections (system requirements → future improvements) plus a verified configuration-reference table, cross-checked against `Program.cs`, `appsettings*.json`, `AuthController`, `vite.config.js`, `.env*`, `package.json`, and `ci.yml`. Documents the single-origin reverse-proxy topology, env vars/secrets, JWT rotation, HTTPS/forwarded-headers, migrations (auto-on-startup vs separate step), `/health`, logging, backups, rollback, monitoring, checklist, and troubleshooting. Deployment inconsistencies surfaced (not code-changed): CORS lacks `AllowCredentials` → same-origin required; dev port `5244` (launchSettings) vs `5199` (Vite proxy); `.env.example` absolute vs `.env.development` relative API URL; `/health` behind HTTPS redirect. No application code was modified.
- Fill `docs/DEPLOYMENT.md`: frontend + backend build; required env/secrets (`Jwt:Key`, `ConnectionStrings:Default`, `Cors:Origins`, `VITE_API_URL`, `VITE_USE_API`); migration application; reverse-proxy / forwarded-headers / HTTPS / same-site cookie topology; health check; rate limits.
- *Files:* `docs/DEPLOYMENT.md` only.
- *Verify:* a second reader could deploy from the doc.

**Decisions (confirmed 2026-07-05):**
- (a) **Fabricated stats → neutralize with honest placeholders** (keep card layout; show `—`/"Coming soon").
- (b) **Migrations → auto-apply on startup, guarded** (`db.Database.Migrate()` outside Development; multi-instance caveat noted in `DEPLOYMENT.md`).
- (c) **Frontend CI → lint + build only** (backend integration tests cover critical paths; no frontend unit-test runner in P0).
- (d) **Employer "Find workers" → wire to the real `GET /workers` search** (reuse `WorkerService.search`).
- Reviews dead-end → **hidden** (no review-write endpoint exists).
