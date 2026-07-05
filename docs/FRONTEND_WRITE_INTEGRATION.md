# Frontend Write Integration

How the React frontend talks to the authenticated ASP.NET Core API for **write**
operations (auth, apply/withdraw, accept/reject, job posting), while keeping the
existing UI, localization, routing, and service-layer architecture unchanged.

This is delivered in four incremental phases. Each phase is verified before the
next begins.

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Foundation: dev proxy, HTTP client with auth + auto-refresh, `AuthService`, `AuthContext`, password login/registration | **done** |
| 2 | Apply / Withdraw (`ApplicationService`) | **done** |
| 3 | Accept / Reject (`EmployerService` / `ContractorService`) | **done** |
| 4 | Job posting (`JobService` via `PostJobModal`) | pending |

The feature flag `VITE_USE_API` (see `src/services/http.js`) switches the whole
service layer between **mock mode** and **API mode**. With it off, everything
runs on local mock data exactly as before — no backend required.

---

## Networking: Development vs Production

The refresh token is stored in an **httpOnly cookie** (`mms_rt`, `Path=/api/v1/auth`).
Cookies are origin- and path-scoped, so the frontend must reach the API in a way
that keeps that cookie first-party. We support two networking modes with **no
backend changes** between them.

### Development — Vite proxy (same-origin)

- `.env.development`: `VITE_API_URL=/api/v1` (relative).
- `vite.config.js`: `server.proxy` forwards `/api → http://localhost:5199`.
- The browser only ever sees the app origin (`http://localhost:5173`). Requests
  to `/api/v1/...` are proxied to the backend server-side.
- Because the request is same-origin, the `mms_rt` cookie is first-party — it is
  set and sent automatically with `credentials: 'include'`, and CORS credential
  handling is not involved at all.

```
Browser ──/api/v1/auth/login──▶ Vite dev server (5173) ──proxy──▶ API (5199)
        ◀── Set-Cookie: mms_rt (first-party to 5173) ──────────────┘
```

### Production — direct API call (absolute URL)

- Set `VITE_API_URL` to the API base, e.g. `https://api.mymazdoorsetu.in/api/v1`.
- No proxy. The browser calls the API host directly.
- To keep the refresh cookie first-party **without** cross-site cookie rules,
  serve the app and API from the **same site** (e.g. app at
  `https://mymazdoorsetu.in`, API at `https://api.mymazdoorsetu.in` — same
  registrable domain). The cookie is `SameSite=Lax`, `Secure` (HTTPS), so it
  flows on top-level same-site requests.
- If the app and API are ever on genuinely different sites, the backend cookie
  policy would need `SameSite=None` + CORS `AllowCredentials` — **a backend
  change, out of scope for this milestone.** The same-site deployment above
  avoids it.

Either way the frontend code is identical: it always calls `VITE_API_URL + path`
with `credentials: 'include'`. Only the value of `VITE_API_URL` (and the presence
of the dev proxy) differs.

---

## Auth flow

Access token lives **in memory only** (`src/services/http.js`); it is never
written to `localStorage`/`sessionStorage`. The refresh token lives in the
httpOnly cookie the browser manages.

- **Login** — `POST /auth/login` `{ phone, password }` → `{ accessToken, user }`
  and `Set-Cookie: mms_rt`. The access token is held in memory; the user is
  mapped to the app's flat user shape.
- **Registration** — `POST /auth/register` returns **201 with no tokens**. The UI
  then redirects to the **login page** (backend-consistent; the user logs in
  explicitly). No auto-login.
- **Session restore on load** — on mount, `AuthContext` calls `POST /auth/refresh`
  (sends the cookie). Success → fresh access token + user; failure → stay logged
  out. Route guards render a loading skeleton while this resolves
  (`initializing`), so protected routes never flash the login page.
- **Auto-refresh on 401** — any authenticated request that returns `401` triggers
  a single, de-duplicated `POST /auth/refresh`; on success the original request is
  retried once. On refresh failure the session-expired handler clears the user.
  `/auth/login`, `/auth/register`, and `/auth/logout` opt out (`skipRefresh`) to
  avoid recursion.
- **Logout** — clears the in-memory token immediately and best-effort calls
  `POST /auth/logout` to revoke the refresh token server-side.

### Endpoint mapping (Phase 1)

| UI action | Method | Endpoint |
|-----------|--------|----------|
| Log in | POST | `/auth/login` |
| Register | POST | `/auth/register` (201, no tokens → redirect to login) |
| Restore session | POST | `/auth/refresh` |
| Log out | POST | `/auth/logout` |

Identity is **always** derived from the JWT `sub` on the backend. The frontend
never sends a user id.

---

## Error handling & retry strategy

- The backend returns RFC 7807 ProblemDetails with a machine-readable `code`.
  `http.js` surfaces this as `ApiError { status, code, detail }`.
- UI updates are **server-confirmed**, not optimistic: the app awaits the API and
  then reflects the result. On error it stays in the prior state and shows a
  localized message.
- Retry is limited to the single auto-refresh-and-retry on `401`. No other
  automatic retries (writes are not blindly replayed).

---

## Phase 2 – Apply & Withdraw

Moves the worker's Apply, Withdraw, and "my applications" flows off mock data and
onto the authenticated API. Identity always comes from the JWT — the frontend
never sends an applicant id.

### Endpoint mapping

| UI action | Service call | API request | Success |
|-----------|--------------|-------------|---------|
| Apply (public Job Detail) | `ApplicationService.apply({ jobId })` | `POST /jobs/{code}/applications` | `201` new / `200` reactivated |
| Apply (worker dashboard "Nearby jobs") | `WorkerService.apply(code)` → `ApplicationService.apply` | `POST /jobs/{code}/applications` | `201` / `200` |
| Withdraw (Job Detail + My applications) | `ApplicationService.withdraw(appId)` | `POST /applications/{id}/withdraw` | `200` |
| CTA state on Job Detail | `ApplicationService.find({ jobId })` | `GET /me/applications` → match `jobCode` | `200` |
| My applications list | `WorkerService.myApplications()` → `ApplicationService.forApplicant` | `GET /me/applications` | `200` |
| Nearby-jobs feed (so Apply hits real codes) | `WorkerService.nearbyJobs()` | `GET /jobs` (open) | `200` |

`jobId` in the frontend **is** the job `code` (e.g. `JOB-2334`); withdraw uses the
application's GUID `id` returned by the API. There is no dedicated "my application
for job X" endpoint, so `find()` fetches `GET /me/applications` (which includes
withdrawn rows) and matches on `jobCode`. `find()` is only called for users who
hold the Worker role, so non-workers never trigger the Worker-gated endpoint.

### DTO mapping

`MyApplicationDto` → legacy application shape via a new `mapMyApplication()` in
`mappers.js`:

```
{ id, jobId: jobCode, jobCode, jobTitle, trade, wage,
  jobStatus, status, appliedAt, decidedAt, updatedAt }
```

`status` (`pending|accepted|rejected|withdrawn`) and `jobStatus`
(`open|closed|completed`) already serialize lowercase, matching the existing
`StatusPill` / `AppStatusPill` keys — no UI change.

### Service changes

- `ApplicationService.apply / withdraw / find / forApplicant` gain an API branch
  (`USE_API`), mock branch preserved.
- `WorkerService.apply / withdrawApplication / myApplications` already delegate to
  `ApplicationService`, so they become API-backed automatically.
- `WorkerService.nearbyJobs` switches to the API open-jobs feed (via `JobService`)
  so the dashboard Apply button targets **real** job codes. This is the one read
  touched, and only because Apply cannot be verified against mock-only codes.

### UI flow, loading & errors

- **Server-confirmed, no optimism**: await the API, then `reload()` the relevant
  `useServiceData` (`find` on Job Detail, the list on My Applications). On failure
  the UI stays in its prior state and shows a message.
- **Loading**: the Apply/Withdraw CTA is disabled while a request is in flight
  (prevents a double-submit that would otherwise 409). Existing skeletons unchanged.
- **Duplicate (`409 application.already_applied`)**: caught and shown as a friendly
  message, then state is re-synced via `reload()`. Not normally reachable from Job
  Detail (the CTA hides once an application exists) but possible from the dashboard.
- **Withdrawn reactivation**: re-applying to a withdrawn row returns `200` with the
  same id; the UI treats `200` and `201` identically (same toast).
- **Other errors**: `job.not_open` / `job.not_found` / `application.self_apply` /
  `application.not_pending` map to specific localized messages; anything else falls
  back to a generic apply/withdraw error.

### Localization impact

- **Job Detail** is fully bilingual: new keys `jobDetail.applyError*` /
  `jobDetail.withdrawError*` are added to `en.js` **and** `hi.js`. Success toasts
  (`jobDetail.applied`, `jobDetail.withdrawn`) already exist.
- **Worker dashboard pages** are English-only by existing convention, so their
  Apply/Withdraw error strings are hardcoded English (no new locale keys).

### Authentication requirements

All four endpoints require a valid access token with the **Worker** role. The HTTP
client attaches the bearer token and transparently refreshes on `401`. Non-workers
never reach these calls from the UI (`find` is role-gated client-side; the Apply
CTA's failure path surfaces a localized error).

### Verification checklist — verified 2026-07-04

- [x] Apply from public Job Detail → CTA flips to Withdraw/status; row appears in My Applications.
- [x] Apply from worker dashboard "Nearby jobs" (real API feed) → success toast; POST returns 201.
- [x] Withdraw from Job Detail → CTA returns to Apply.
- [x] Withdraw from My Applications → row updates.
- [x] Re-apply after withdrawal → `200`, same application id reactivated (pending).
- [x] Duplicate apply → `409` handled with a friendly message, no crash.
- [x] **Refresh after applying** → Job Detail CTA and My Applications both restored from the backend.
- [x] **Authorization** → a worker cannot withdraw another worker's application (`403 application.forbidden`); the UI shows a graceful error and preserves state (no crash, no optimistic removal).
- [x] Errors localized on Job Detail (English **and** Hindi).
- [x] Token refresh transparent during these calls (session restored on every hard load).

---

## Phase 3 – View Applicants, Accept & Reject

Moves the poster's application-management flows (Employer **and** Contractor) off
mock data and onto the authenticated API. Ownership and identity come from the
JWT — the frontend never sends a poster id.

### Endpoint mapping

| UI action | Service call | API request(s) | Success |
|-----------|--------------|----------------|---------|
| View applicants (Employer) | `EmployerService.applications()` → `ApplicationService.forPoster(_, employer)` | `GET /me/posted-jobs` (filter `postedByRole=employer`) → `GET /jobs/{code}/applications` per job | `200` |
| View applicants (Contractor) | `ContractorService.applicants()` → `ApplicationService.forPoster(_, contractor)` | same, filtered `postedByRole=contractor` | `200` |
| Accept | `*.decideApplication(id, 'accepted')` → `ApplicationService.decide` | `POST /applications/{id}/accept` | `200` (openings −1) |
| Reject | `*.decideApplication(id, 'rejected')` → `ApplicationService.decide` | `POST /applications/{id}/reject` | `200` |

There is no single "all applicants across my jobs" endpoint, so `forPoster`
fetches the poster's jobs (`/me/posted-jobs`), keeps those posted under the
requested role, then fetches applicants per job and flattens them (N+1, accepted
for MVP — the poster's job count is small). The poster id argument is ignored in
API mode; the token's `sub` identifies the poster.

### DTO mapping

`ApplicantDto` → the legacy flat applicant shape via a new `mapApplicant()` in
`mappers.js`:

```
{ id, applicantId: applicant.id, applicantName: applicant.name,
  trade: applicant.trade, rating: applicant.rating,
  jobId: jobCode, jobCode, jobTitle, postedByRole, status,
  appliedAt, decidedAt, updatedAt }
```

`status` (`pending|accepted|rejected|withdrawn`) and `postedByRole`
(`employer|contractor`) serialize lowercase, matching the existing `StatusPill`
and role filtering — no UI change.

### Service replacements

- `ApplicationService.forPoster` and `ApplicationService.decide` gain an API
  branch (`USE_API`); mock branches preserved.
- `EmployerService.applications` / `decideApplication` and
  `ContractorService.applicants` / `decideApplication` already delegate to
  `ApplicationService`, so they become API-backed automatically — **no change to
  the Employer/Contractor service files.**
- The employer/contractor **dashboard reads** (`myJobs`, `summary`,
  `findWorkers`, `savedWorkers`, `managedWorkers`, `projects`) stay on mock.

### Loading, transitions & duplicate actions

- **Server-confirmed, no optimism**: await the API, then `reload()` the applicant
  list. Accept/Reject buttons are disabled per-row (`busyId`) while in flight.
- **Transitions**: accept `pending → accepted` (decrements job openings, no
  auto-close); reject `pending → rejected`. Buttons only render on `pending`
  rows, so decided rows can't be re-decided from the UI.
- **Duplicate / stale actions**: a second decide on an already-decided
  application → `409 application.not_pending`; deciding on a `Completed` job →
  `409 application.job_completed`. Both are caught and shown as a friendly
  message, then the list is re-synced via `reload()`.

### Error handling & authorization behaviour

- Backend ProblemDetails `code` → hardcoded English messages (these dashboard
  pages are English-only by existing convention):
  - `application.not_pending` → "This application was already decided."
  - `application.job_completed` → "This job is completed; applications can no longer be decided."
  - `application.forbidden` → "You can only manage applications for your own jobs."
  - `application.not_found` → "This application no longer exists."
  - anything else → generic accept/reject failure.
- **Ownership** is enforced server-side: `GET /jobs/{code}/applications` and
  accept/reject return `403 application.forbidden` for a non-owner. In normal use
  `forPoster` only reads the poster's own jobs, so ownership always holds; a
  forced/stale cross-owner action surfaces the graceful 403 message.
- **Authorization**: all endpoints require the `Employer` or `Contractor` role.
  The applicant pages live under the role-guarded `/app/employer` and
  `/app/contractor` routes, so a worker never reaches them.

### Verification checklist — verified 2026-07-05

- [x] Employer Applications page lists real applicants for the employer's posted jobs.
- [x] Contractor Applicants page lists real applicants for the contractor's posted jobs.
- [x] Accept a pending applicant → status becomes Accepted; **job openings decremented** (2 → 1, confirmed in-UI via the public job read and at the HTTP layer).
- [x] Reject a pending applicant → status becomes Rejected.
- [x] Buttons disappear once decided; **refresh restores the decided state from the backend and the action buttons stay hidden** (accept and reject).
- [x] Duplicate/stale decide → `409 application.not_pending` handled with a friendly message, no crash.
- [x] Decide on a completed job → `409 application.job_completed` handled gracefully (real backend response).
- [x] Ownership: a poster cannot view/accept/reject applications on someone else's job (`403`); UI shows a graceful message and preserves state (forced-403 interception + HTTP layer).
- [x] Role scoping: `forPoster` filters `/me/posted-jobs` by `postedByRole`, so a poster sees only the persona being viewed (contractor page shows only contractor-posted jobs' applicants).
- [x] Token refresh transparent; Phase 1 & 2 flows still pass.

---

## Remaining mock services (dashboard reads)

These stay on **mock data** for this milestone. They are the dashboard read
widgets whose backend endpoints are not part of the write integration. They are
marked in code with a `MOCK (dashboard read)` banner comment so future backend
wiring is obvious:

- `WorkerService` — dashboard summary, availability, profile self-view *(apply/withdraw/my-applications and the nearby-jobs feed move to the API in Phase 2)*
- `ContractorService` — my-jobs list, managed workers, projects, dashboard summary *(view-applicants and accept/reject move to the API in Phase 3)*
- `EmployerService` — my-jobs list, find/saved workers, dashboard summary *(view-applicants and accept/reject move to the API in Phase 3)*
- `AgentService`, `AdminService` — agent/admin dashboards
- `NotificationService`, `MessageService`, `ComplaintService`, `ReviewService`

`AuthService`, `ApplicationService` (Phase 2), and `JobService` (Phase 4) are the
services that move to the API in this milestone.
