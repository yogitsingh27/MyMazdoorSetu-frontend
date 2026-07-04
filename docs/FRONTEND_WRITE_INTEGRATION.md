# Frontend Write Integration

How the React frontend talks to the authenticated ASP.NET Core API for **write**
operations (auth, apply/withdraw, accept/reject, job posting), while keeping the
existing UI, localization, routing, and service-layer architecture unchanged.

This is delivered in four incremental phases. Each phase is verified before the
next begins.

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Foundation: dev proxy, HTTP client with auth + auto-refresh, `AuthService`, `AuthContext`, password login/registration | **done** |
| 2 | Apply / Withdraw (`ApplicationService`) | pending |
| 3 | Accept / Reject (`EmployerService` / `ContractorService`) | pending |
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

## Remaining mock services (dashboard reads)

These stay on **mock data** for this milestone. They are the dashboard read
widgets whose backend endpoints are not part of the write integration. They are
marked in code with a `MOCK (dashboard read)` banner comment so future backend
wiring is obvious:

- `WorkerService` — worker dashboard summary, saved jobs, profile self-view
- `ContractorService` — managed workers, contractor dashboard summary
- `EmployerService` — saved workers, employer dashboard summary *(accept/reject
  moves to the API in Phase 3)*
- `AgentService`, `AdminService` — agent/admin dashboards
- `NotificationService`, `MessageService`, `ComplaintService`, `ReviewService`

`AuthService`, `ApplicationService` (Phase 2), and `JobService` (Phase 4) are the
services that move to the API in this milestone.
