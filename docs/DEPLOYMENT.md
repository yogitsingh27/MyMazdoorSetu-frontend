# MyMazdoorSetu — Production Deployment Guide

Complete runbook for deploying MyMazdoorSetu to production. Documentation only —
it describes how to deploy the app **as it is built today**; it does not change
behaviour.

- **Frontend:** React 18 + Vite 5 SPA (static files).
- **Backend:** ASP.NET Core 8 Web API (`/api/v1/*`, `/health`).
- **Database:** SQL Server (EF Core 8, code-first migrations).

> **Supported topology (read first).** The frontend and backend are served from a
> **single public origin** behind one reverse proxy: `/api/*` and `/health` route
> to the backend, everything else serves the static SPA. This makes the
> authentication **refresh cookie first-party** and avoids CORS entirely — the
> same model the Vite dev proxy emulates. A genuinely split-origin deployment
> (frontend and API on different hosts) is **not supported as built**, because the
> CORS policy does not enable credentials and the refresh cookie is `SameSite=Lax`
> — see §9 and §17.

---

## SECTION 1 — System requirements

**Build/CI**
- Node.js 20+ and npm (frontend build).
- .NET SDK 8.0.x (backend build/test). Use the x64 SDK.
- `dotnet-ef` CLI if you apply migrations manually: `dotnet tool install --global dotnet-ef`.

**Runtime (production host)**
- .NET 8 ASP.NET Core runtime (or self-contained publish).
- SQL Server 2019+ (Azure SQL, SQL Server on VM/container, or managed equivalent).
- A reverse proxy that terminates TLS and sets `X-Forwarded-Proto`/`X-Forwarded-For`
  (nginx, Caddy, or a platform ingress).
- Static file hosting for the SPA (the same reverse proxy, a CDN, or a static host).

**Ports (default local dev)**
- API (dev): run on `http://localhost:5199` (the Vite proxy target — see §17 note 2).
- Vite dev server: `http://localhost:5173`.

---

## SECTION 2 — Repository structure

```
mymazdoorsetu/
├── src/                         # React SPA source
├── index.html, vite.config.js   # Vite entry + dev proxy (/api → :5199)
├── package.json                 # scripts: dev, build, preview, lint
├── .eslintrc.cjs                # ESLint config (lint gate)
├── .env.example                 # frontend env template
├── .env.development             # dev frontend env (VITE_USE_API, VITE_API_URL)
├── vercel.json                  # SPA rewrite (all routes → index.html)
├── .github/workflows/ci.yml     # CI: frontend lint+build, backend build+test
├── Backend/
│   ├── MazdoorSetu.sln
│   ├── src/MazdoorSetu.Api/     # Web API (Program.cs, Features/*, Persistence/*)
│   │   ├── appsettings.json               # base (no secrets)
│   │   ├── appsettings.Development.json    # dev (LocalDB + dev JWT key)
│   │   └── appsettings.Production.json     # TEMPLATE (placeholders only)
│   ├── src/MazdoorSetu.Core/    # entities & enums
│   └── tests/MazdoorSetu.IntegrationTests/ # critical-path API tests
└── docs/                        # this guide + architecture/audit docs
```

---

## SECTION 3 — Frontend deployment

The SPA is a set of static files. **Vite env vars are inlined at build time**, so
the API URL and feature flag must be set **when you build**, not at runtime.

1. Install and build:
   ```bash
   npm ci
   VITE_USE_API=true VITE_API_URL=/api/v1 npm run build
   ```
   - `VITE_API_URL=/api/v1` is **relative** — correct for the single-origin topology
     (§9). The browser calls the app's own origin and the proxy forwards `/api`.
   - Output is written to `dist/` — `index.html` plus content-hashed assets under
     `dist/assets/`.
2. Serve `dist/` statically with an **SPA fallback** so client-side routes resolve
   to `index.html` (React Router uses `BrowserRouter`). On Vercel this is
   `vercel.json` (`rewrites` → `/index.html`); on nginx use `try_files` (§9).
3. Cache `dist/assets/*` aggressively (content-hashed, immutable); serve
   `index.html` with `no-cache` so new deploys are picked up.

**Static assets:** all JS/CSS under `assets/` are hashed (e.g.
`index-<hash>.js`); safe to cache forever. `index.html` is the only unhashed,
must-revalidate file. There is no favicon configured (a `/favicon.ico` 404 is
harmless).

---

## SECTION 4 — Backend deployment

1. Publish:
   ```bash
   cd Backend
   dotnet publish src/MazdoorSetu.Api/MazdoorSetu.Api.csproj -c Release -o ./publish
   ```
2. Run behind the reverse proxy, binding to a local port (TLS terminates at the proxy):
   ```bash
   ASPNETCORE_ENVIRONMENT=Production \
   ASPNETCORE_URLS=http://0.0.0.0:8080 \
   ConnectionStrings__Default="<sql-connection-string>" \
   Jwt__Key="<strong-secret>" \
   Jwt__Issuer=mazdoorsetu Jwt__Audience=mazdoorsetu \
   dotnet ./publish/MazdoorSetu.Api.dll
   ```
   Run under a supervisor (systemd, container orchestrator, or platform runtime).
   Running the published DLL directly means **launch profiles do not apply**, so
   `ASPNETCORE_ENVIRONMENT` is honoured (unlike `dotnet run`, which reads
   `launchSettings.json`).
3. In `Production` the app: serves **no Swagger**, applies **pending migrations on
   startup** (relational providers), installs the **ProblemDetails exception
   handler** and **HSTS**, and exposes **`/health`**.

The API exposes only `/api/v1/*` and `/health` (and `/swagger` in Development). It
does **not** serve the SPA — that is the reverse proxy's job (§9).

---

## SECTION 5 — Database deployment

- Provision a SQL Server database and a least-privilege application login (needs
  DDL for migrations if you let the app migrate on startup, or only DML if you run
  migrations as a separate step with a different principal).
- The schema is created by **EF Core migrations** (§10). Three migrations exist:
  `InitialCreate`, `SeedReferenceData`, `AddAuth`.
- **Reference vocabulary (Trades, Cities) is seeded by the `SeedReferenceData`
  migration via `HasData`** — a freshly migrated database already contains the 12
  trades and 6 cities. No manual seeding is required.
- **Demo/sample data is NOT seeded in production.** `DevDataSeeder` runs only in
  the `Development` environment; production starts with an empty user/job set.
- Connection string example (Azure SQL):
  ```
  Server=tcp:<server>.database.windows.net,1433;Database=MazdoorSetu;User ID=<user>;Password=<pwd>;Encrypt=True;TrustServerCertificate=False;
  ```

---

## SECTION 6 — Environment variables

ASP.NET Core maps `__` (double underscore) to the config `:` separator. All of
these are read from configuration; environment variables override any appsettings
file.

### Backend (required in production)

| Variable | Purpose | Example |
|----------|---------|---------|
| `ASPNETCORE_ENVIRONMENT` | Must be `Production` (enables migrate-on-startup, disables Swagger). | `Production` |
| `ASPNETCORE_URLS` | Kestrel bind address (behind the proxy). | `http://0.0.0.0:8080` |
| `ConnectionStrings__Default` | SQL Server connection string. **Required** (app has no default). | *(see §5)* |
| `Jwt__Key` | JWT signing secret. **Required** (app throws if the `Jwt` section is missing). | 32+ char random secret |
| `Jwt__Issuer` | Token issuer. | `mazdoorsetu` |
| `Jwt__Audience` | Token audience. | `mazdoorsetu` |

### Backend (optional — have safe defaults)

| Variable | Default | Purpose |
|----------|---------|---------|
| `Jwt__AccessTokenMinutes` | `30` | Access-token lifetime. |
| `Jwt__RefreshTokenDays` | `14` | Refresh-token lifetime (also the `mms_rt` cookie expiry). |
| `Cors__Origins__0`, `__1`, … | *(unset → dev fallback `http://localhost:5173`)* | Allowed CORS origins. Only relevant if you split origins — **not the supported topology** (§9). |
| `RateLimit__AuthPermitPerMinute` | `20` | Auth-endpoint requests per IP per minute. |
| `RateLimit__WritePermitPerMinute` | `60` | State-changing (non-GET, non-`/auth`) requests per IP per minute. |

### Frontend (build-time only, inlined by Vite)

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_USE_API` | `true` | Use the real API (not mock services). |
| `VITE_API_URL` | `/api/v1` | Relative API base for the single-origin topology. |

> `.env.example` shows an **absolute** `VITE_API_URL=http://localhost:5199/api/v1`
> for a no-proxy local setup; production and the dev proxy use the **relative**
> `/api/v1` as in `.env.development` (§17 note 3).

---

## SECTION 7 — JWT secrets

- The signing key is read from `Jwt:Key` (env `Jwt__Key`). In production it **must**
  come from a secret store (platform secrets / KMS / vault) and **must never be
  committed**.
- `appsettings.Development.json` contains a clearly-labelled **dev-only** key
  (`"dev-only-signing-key-do-not-use-in-production-…"`). `appsettings.json` (the
  base, used in prod) contains **no** `Jwt` section, so production **must** supply
  it via environment/secret — the app throws `Missing 'Jwt' configuration section.`
  on startup otherwise (fail-fast).
- Use a strong random secret (≥ 32 bytes) — HMAC-SHA256 signing.
- **Rotation:** changing `Jwt__Key` invalidates all existing **access** tokens
  immediately (they fail signature validation → `401`). **Refresh** tokens are
  opaque random records hashed in the DB — they are *not* signed by the key, so
  they survive a rotation. The frontend auto-refreshes on `401`, so most users are
  reissued a new access token (signed with the new key) via their still-valid
  refresh cookie and **stay logged in without re-authenticating**; only users
  whose refresh token is also expired/absent are prompted to log in. Rotating all
  instances at once avoids brief cross-instance validation failures during the
  rollout.

---

## SECTION 8 — HTTPS

- TLS is **terminated at the reverse proxy**; the app runs plain HTTP internally.
- The app calls `UseHttpsRedirection()` and, in production, `UseHsts()`.
- The refresh cookie (`mms_rt`) is issued with `Secure = Request.IsHttps`. Behind a
  TLS-terminating proxy the app sees HTTP unless forwarded headers are honoured, so
  **`UseForwardedHeaders()` (already enabled) is what makes the cookie `Secure` in
  production** (§9). Verify after deploy that the `Set-Cookie: mms_rt=…` response
  includes `Secure` (§16 checklist).
- Obtain/renew certificates at the proxy (e.g. Let's Encrypt via Caddy/nginx, or a
  platform-managed certificate).

---

## SECTION 9 — Reverse proxy configuration

The reverse proxy provides the **single public origin** and forwarded headers.

### Routing

- `/api/*` and `/health` → backend (Kestrel, e.g. `http://127.0.0.1:8080`).
- everything else → static SPA (`dist/`), with SPA fallback to `index.html`.

### Required forwarded headers

Set `X-Forwarded-Proto` and `X-Forwarded-For`. The app runs `UseForwardedHeaders()`
**first** in the pipeline so `Request.IsHttps` and the client IP are accurate; this
drives the `Secure` cookie flag (§8) and per-client rate-limit partitioning (§16).

### Forwarded-headers trust (KnownProxies / KnownNetworks)

In `Program.cs` the forwarded-headers options **clear** `KnownNetworks` and
`KnownProxies`:

```csharp
o.KnownNetworks.Clear();
o.KnownProxies.Clear();
```

- **Appropriate for the current deployment approach**, where the app is reachable
  only through the platform's own proxy (a managed PaaS/container ingress that
  terminates TLS) and is not directly exposed to clients — clearing the lists tells
  ASP.NET Core to trust the forwarded headers from that single hop.
- **Deployments with a known, fixed reverse proxy should configure these
  explicitly** for a tighter posture — add the proxy's address to `KnownProxies`
  (or its subnet to `KnownNetworks`) so forged `X-Forwarded-*` headers from other
  sources are ignored:
  ```csharp
  o.KnownProxies.Add(IPAddress.Parse("10.0.0.4"));
  // or: o.KnownNetworks.Add(new IPNetwork(IPAddress.Parse("10.0.0.0"), 24));
  ```
  Prefer sourcing these from configuration so they differ per environment without a
  code change. If the app is ever exposed directly (no proxy), do **not** trust
  forwarded headers.

### Example — nginx (single origin)

```nginx
server {
  listen 443 ssl;
  server_name mymazdoorsetu.example;
  # ... ssl_certificate / ssl_certificate_key ...

  # API + health → backend
  location ~ ^/(api|health) {
    proxy_pass         http://127.0.0.1:8080;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
  }

  # SPA static + fallback
  root /var/www/mymazdoorsetu/dist;
  location / { try_files $uri /index.html; }
}
```

### CORS

CORS is configured (`Cors:Origins`, default `http://localhost:5173`) with
`AllowAnyHeader().AllowAnyMethod()` but **without `AllowCredentials()`**. In the
single-origin topology, requests are **same-origin**, so CORS is never invoked and
this is a non-issue. If you split origins, the credentialed refresh request will be
blocked by the browser — that split requires a backend change (`AllowCredentials` +
`SameSite=None` cookie), which is **out of scope** (§17).

---

## SECTION 10 — Database migrations

Three migrations exist: `InitialCreate`, `SeedReferenceData`, `AddAuth`.

**Default (single-instance beta): automatic on startup.** In any non-`Development`
environment the app runs `db.Database.MigrateAsync()` at startup for relational
providers. Deploying a new version applies pending migrations automatically.

**Multi-instance / safer: apply migrations as a separate deploy step** so instances
don't race and you control timing:

```bash
cd Backend
dotnet ef database update \
  --project src/MazdoorSetu.Api/MazdoorSetu.Api.csproj \
  --connection "<ConnectionStrings__Default>"
# or apply a generated SQL script reviewed beforehand:
dotnet ef migrations script --idempotent -o migrate.sql
```

If you adopt the separate-step approach, you may keep the startup migration (it
becomes a no-op once the DB is current) or gate it off; as built it stays on
outside Development. For zero-downtime, prefer expand/contract migrations.

---

## SECTION 11 — Health endpoint

- `GET /health` (anonymous). Returns `200 Healthy` when the app can reach the
  database; `503` otherwise (`DbHealthCheck` calls `CanConnectAsync`).
- Point the platform's liveness/readiness probe at `/health` **through the proxy**
  (HTTPS) or configure the probe to send `X-Forwarded-Proto: https`. A raw plain-HTTP
  probe that bypasses the proxy hits `UseHttpsRedirection()` and receives a `307`
  redirect (§17 note 4).

---

## SECTION 12 — Logging

- The app enables **HTTP request logging** (`UseHttpLogging`): method, path, status,
  duration — written to the standard .NET logger.
- EF Core logs SQL at `Information` in Development; set production log levels via
  `Logging__LogLevel__Default` (the `appsettings.Production.json` template sets
  `Warning`). Recommended production levels: `Default=Warning`,
  `Microsoft.AspNetCore=Warning`.
- Ship stdout/stderr to your platform's log aggregator. There is **no** structured
  logging / correlation IDs / external sink configured yet (§18).

---

## SECTION 13 — Backups

- Application state lives entirely in **SQL Server** (users, jobs, applications,
  refresh tokens, reference data). Back it up with the database platform's native
  tooling:
  - **Azure SQL:** automated point-in-time restore (retention configurable);
    optionally long-term retention.
  - **Self-managed:** scheduled full + differential + transaction-log backups; test
    restores regularly.
- No file/blob storage to back up (KYC documents are stored as **hashes only**, in
  the DB; no raw uploads).
- The frontend is stateless static output rebuilt from source — no backup needed.
- Secrets (`Jwt__Key`, DB creds) live in your secret store — back that up per its
  own guidance.

---

## SECTION 14 — Rollback procedure

1. **Frontend:** redeploy the previous `dist/` build (or previous immutable
   deployment). Static and instant.
2. **Backend:** redeploy the previous API build/image.
3. **Database:** migrations are **not auto-reverted**. If a release added a
   migration, rolling the app back does **not** roll back the schema. Options:
   - Prefer **backward-compatible (expand/contract)** migrations so the previous app
     version runs against the new schema — then a code rollback needs no DB change.
   - If a migration must be undone: `dotnet ef database update <PreviousMigration>`
     (only if the down-migration is safe and non-destructive), or restore from a
     backup taken **before** the deploy (accepting data loss since that point).
4. Because migrations apply on startup, **take a database backup immediately before
   each deploy** so a restore point exists (§13, §16).

---

## SECTION 15 — Monitoring

Monitor at minimum:
- **Liveness/readiness:** `/health` (§11).
- **HTTP metrics:** request rate, error rate (5xx), latency — from proxy/platform.
- **Auth health:** spikes in `401`/`403`; `429` from rate limiting
  (`code: auth.rate_limited`) indicating throttling or abuse.
- **Database:** connections, DTU/CPU, storage, failed connections (surfaces as
  `503` on `/health`).
- **Logs:** unhandled `500`s (returned as `code: server.error`).

No APM/error-tracking integration ships today — see §18.

---

## SECTION 16 — Production checklist

Before/at go-live:

- [ ] `ASPNETCORE_ENVIRONMENT=Production`.
- [ ] `Jwt__Key` set to a strong secret from the secret store (not the dev key); app starts (no "Missing 'Jwt'").
- [ ] `ConnectionStrings__Default` set; `/health` returns `200 Healthy`.
- [ ] `Jwt__Issuer` / `Jwt__Audience` set (match across instances).
- [ ] Reverse proxy sends `X-Forwarded-Proto` / `X-Forwarded-For`; single origin routes `/api` + `/health` to backend, rest to SPA.
- [ ] Login response `Set-Cookie: mms_rt=…` includes **`Secure`**, `HttpOnly`, `SameSite=Lax`, `Path=/api/v1/auth`.
- [ ] `GET /swagger/index.html` returns **404** (Swagger off in prod).
- [ ] Migrations applied (auto on startup, or the separate step ran); Trades/Cities present.
- [ ] Frontend built with `VITE_USE_API=true` and `VITE_API_URL=/api/v1`; SPA deep links resolve (fallback to `index.html`).
- [ ] Rate limits appropriate (`RateLimit__AuthPermitPerMinute` / `WritePermitPerMinute`) — defaults 20/60.
- [ ] CORS: same-origin deploy (no cross-origin credential reliance).
- [ ] Database backup taken immediately before deploy; restore path known.
- [ ] End-to-end smoke: register → login → post a job → apply → accept.

---

## SECTION 17 — Common troubleshooting

1. **Login works but user is logged out on refresh / cookie missing `Secure`.**
   The proxy isn't sending `X-Forwarded-Proto: https`, so the app sees HTTP and
   issues a non-`Secure` cookie (a `Secure` cookie is then dropped by the browser
   over HTTPS boundaries). Fix the proxy forwarded headers (§9); confirm
   `UseForwardedHeaders` trusts the proxy.

2. **Dev only: frontend can't reach the API (proxy 502/ECONNREFUSED).**
   `launchSettings.json` defaults the API to `:5244`, but the Vite proxy
   (`vite.config.js`) targets `:5199`. Run the API on the proxy's port:
   `dotnet run --project Backend/src/MazdoorSetu.Api --urls http://localhost:5199`.
   *(Documented inconsistency — dev convenience only; no production impact.)*

3. **Auth requests blocked by CORS in a split-origin deploy.**
   The CORS policy does not enable credentials and the cookie is `SameSite=Lax`, so
   credentialed cross-origin auth fails. Deploy **same-origin** (§9). A true split
   would require a backend change (out of scope).

4. **`/health` probe returns 307.** A plain-HTTP probe bypassing the proxy hits
   `UseHttpsRedirection`. Probe through the proxy (HTTPS) or send
   `X-Forwarded-Proto: https`.

5. **App won't start: "Missing 'Jwt' configuration section."** `Jwt__Key` (and the
   `Jwt` section) isn't provided in this environment. Set the env/secret (§7).

6. **App won't start: SQL/login error.** `ConnectionStrings__Default` missing or
   wrong, or the DB login lacks rights (incl. DDL if migrating on startup). Verify
   the connection string and grants (§5).

7. **`429 auth.rate_limited`.** Legit throttling. Behind a proxy, ensure forwarded
   headers are set so limiting partitions by real client IP, not the proxy IP.
   Tune `RateLimit__*` if needed.

8. **SPA deep link 404s on refresh.** Missing SPA fallback — configure
   `try_files … /index.html` (nginx) or the platform's rewrite (§3, §9).

---

## SECTION 18 — Future production improvements

Deferred (see `docs/BETA_READINESS.md` P1/P2):
- **Split-origin support:** enable CORS `AllowCredentials` + `SameSite=None` cookie
  to allow frontend/API on different hosts.
- **Refresh-token reuse detection** and account lockout.
- **Structured logging** (Serilog/OpenTelemetry), correlation IDs, and an
  APM/error-tracking sink.
- **Multi-instance migration strategy** (separate migration job; expand/contract;
  zero-downtime) rather than migrate-on-startup.
- **Containerization** (Dockerfile) and infrastructure-as-code; blue/green or
  rolling deploys.
- **Optimistic concurrency** on Job/Application; performance work (N+1 reductions,
  route code-splitting).
- **Real dashboard data**, messaging, notifications, payments, agent/admin, and KYC
  verification (currently mock/sample — labelled in-app).

---

## Verified configuration reference

Cross-checked against `Program.cs`, `appsettings*.json`, `AuthController`,
`vite.config.js`, `.env*`, `package.json`, `.github/workflows/ci.yml`:

| Concern | As built |
|---------|----------|
| API base path | `/api/v1` |
| Health | `GET /health` (anonymous, DB check) |
| Swagger | Development only (404 in prod) |
| Migrations | auto on startup outside Development, relational only; 3 migrations |
| Reference data | seeded via `HasData` migration (Trades/Cities); demo data dev-only |
| CORS | `Cors:Origins` (default `http://localhost:5173`), any header/method, **no credentials** |
| Forwarded headers | `UseForwardedHeaders` first; XFF + XFP; KnownProxies/Networks cleared |
| Rate limiting | auth 20/min/IP, writes 60/min/IP (GET & `/auth` exempt); configurable |
| Access token | 30 min (`Jwt__AccessTokenMinutes`) |
| Refresh cookie | `mms_rt`, `HttpOnly`, `Secure=Request.IsHttps`, `SameSite=Lax`, `Path=/api/v1/auth`, 14-day expiry |
| Exception handler | ProblemDetails (`code: server.error`) in prod; HSTS in prod |
| Frontend build | `npm run build` → `dist/`; env `VITE_USE_API`, `VITE_API_URL` (build-time) |
| CI | `.github/workflows/ci.yml`: frontend `npm ci`/lint/build; backend restore/build/integration tests |
```
