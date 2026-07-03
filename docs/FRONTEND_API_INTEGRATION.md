# Frontend ↔ Backend Read Integration

How the React frontend's public read pages consume the ASP.NET Core public API,
while the UI, routing, localization, and dashboards remain unchanged.

## Design in one line

The **service layer** (`src/services/*`) is the only place that changed. Each public
read method now calls the backend and **maps the flat DTO back into the nested shape the
existing components already consume** — so no component layout changed.

## Environment variables

| Variable | Purpose |
|---|---|
| `VITE_USE_API` | Feature flag. `true`/`1` → use the backend API; anything else → use the in-app mock data. |
| `VITE_API_URL` | Base URL of the public API, e.g. `http://localhost:5199/api/v1`. **Required when `VITE_USE_API` is on** — there is no hardcoded default. |

Configured in `.env.development` (committed) with `.env.example` as a template. If
`VITE_USE_API` is on but `VITE_API_URL` is missing, `http.js` logs a clear configuration
error at startup and every `request()` throws `config.missing_api_url` — the app never
silently guesses a URL. The backend's CORS policy allows the Vite dev origin
(`http://localhost:5173`).

**Run locally:** start the backend (listening at `VITE_API_URL`'s host) and `npm run dev`.
To fall back to mock data, set `VITE_USE_API=false` and restart Vite.

## Service ↔ endpoint mapping

| Page | Service method | Backend endpoint | Response DTO |
|---|---|---|---|
| Jobs Browse | `JobService.search(filters)` | `GET /jobs?q&trade&city&pageSize=100` | `PagedResult<JobSummaryDto>` |
| Job Detail | `JobService.get(code)` | `GET /jobs/{code}` | `JobDetailDto` |
| Workers Browse | `WorkerService.search(filters)` | `GET /workers?q&trade&city&availability&verified&pageSize=100` | `PagedResult<WorkerSummaryDto>` |
| Worker Detail | `WorkerService.get(id)` | `GET /workers/{id}` | `WorkerDetailDto` |
| Employer Detail | `EmployerService.getPublic(id)` | `GET /employers/{id}` | `EmployerDetailDto` |

Reviews are **embedded** in the worker/employer detail responses (no separate call).
Every method is flag-gated: in mock mode it resolves from local data; in API mode it calls
the endpoint. Both paths return the **same shape**, so components are mode-agnostic.

## Mapper responsibilities (`src/services/mappers.js`)

- `mapJobSummary` / `mapJobDetail` — flatten `JobSummaryDto` / `JobDetailDto`; rename `code`→`id`, `posterReviewCount`→`posterReviews`; nest the poster and similar jobs.
- `mapWorkerSummary` / `mapWorkerDetail` — rebuild the nested `workerProfile` object (`trade`, `rating`, `availability`, `jobsDone`, `experienceYears`, `skills`, `portfolio`) the cards/detail read.
- `mapEmployerDetail` — rebuild `employerProfile`; **derive a stable avatar color** from the org name (the employer DTO has no `avatarColor`).
- `mapReview` — `authorName`→`by`, `authorLabel`→`role`, ISO `date`→`"14 Jun"`, `categories[]`→`cats{}` object.
- `deriveAvatarColor(name)` — deterministic palette pick (amber/navy/teal).
- `formatReviewDate(iso)` — ISO → short `"DD Mon"`.

Mock mode uses small `enrichMock*` helpers inside each service (resolving poster/similar/
reviews/openJobs from the mock arrays) so its output matches the mapped API output exactly.

## DTO differences the mappers bridge

| Frontend expects | Backend DTO | Bridge |
|---|---|---|
| `job.id` (`"JOB-2291"`) | `code` | rename |
| `job.posterReviews` | `posterReviewCount` | rename |
| nested `worker.workerProfile.*` | flat `trade/rating/jobsDone/...` | re-nest |
| `review.by` / `.role` / `.date` / `.cats` | `authorName` / `authorLabel` / ISO `date` / `categories[]` | rename + format + array→object |
| poster resolved from `USERS` | embedded `poster` object | provided by API; page reads `job.poster` |
| similar/openJobs from `JOBS` | embedded `similar` / `openJobs` | provided by API |
| employer `avatarColor` | *(absent)* | derived client-side from `orgName` |
| enum values (`"employer"`, `"open"`) | lowercase enum strings | already match (no bridge needed) |

## Error handling & loading states

- **Loading** — unchanged; services return promises and the existing `useServiceData` hook drives the existing `PageSkeleton`s (detail pages now show the skeleton while the whole entity loads).
- **404** — detail `get`/`getPublic` resolve to `null` (via `http.getOrNull`), so each detail page renders its existing not-found `EmptyState`.
- **Network/5xx** — `request()` throws `ApiError { status, code }` carrying the backend's machine-readable `code` (localizable client-side). Browse pages default the list to `[]` (`data ?? []`) so they degrade to the existing empty state instead of crashing; the failed request is visible in the Network tab.

## Why the component tree was preserved

The mock data shape (nested `workerProfile`, `job.id`, `USERS`-resolved posters) is baked
into many components and the landing/dashboard pages that still use the mock arrays.
Changing component props would have rippled into dashboards and risked the UX. Instead the
service layer — the architecture's designated swap point — absorbs the shape difference.
The only page changes are **data-source rewires** in the three detail pages (which
previously bypassed the service layer by reading mock arrays directly); their JSX/layout is
untouched, and routing, localization, and dashboards are unchanged.

## Files changed

**New:** `src/services/mappers.js`, `.env.development`, `.env.example`, this doc.
**Modified:** `src/services/http.js`, `JobService.js`, `WorkerService.js`, `EmployerService.js`; `src/pages/public/{JobsBrowse,JobDetail,WorkersBrowse,WorkerDetail,EmployerDetail}.jsx`.
**Untouched:** routing, all layouts/JSX structure, localization, dashboards and their service methods, `ReviewService`/`ApplicationService`/`IntentService`, and all mock data files.
