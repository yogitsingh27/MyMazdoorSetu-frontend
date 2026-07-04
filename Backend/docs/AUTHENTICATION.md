# Authentication Architecture

How MyMazdoorSetu authenticates users. Security rationale and hardening details live in
`docs/SECURITY.md`; endpoint contracts in `docs/API.md`.

## Overview

- **Method:** phone + password (OTP is a documented future migration — see `SECURITY.md`).
- **Tokens:** short-lived JWT **access token** + rotating **refresh token**.
- **Custom, not ASP.NET Core Identity:** the app has a hand-built multi-role `User`; we reuse
  only Identity's `PasswordHasher<User>` (PBKDF2) and the `JwtBearer` validation middleware,
  and hand-roll token issuance + a `RefreshTokens` table. This fits the modular-monolith.
- **Registration issues no tokens.** Register → `201 Created`; the client then logs in
  explicitly. This keeps the flow simple and makes future OTP verification easy to insert
  (a `Pending` account that must verify before it can log in).

## Token model

**Access token (JWT, HS256, ~30 min).** Claims: `sub` (user id), `name`, `jti`, and one
`role` claim per held role (PascalCase — `Worker`, `Employer`, …). Signed with the
`Jwt:Key` secret. Validated on every protected request (`issuer`, `audience`, `lifetime`,
`signature`). Stateless — not revocable on its own, hence the short lifetime.

**Refresh token (~14 days, rotating).** A 256-bit random value. **Only its SHA-256 hash is
stored** (`RefreshTokens.TokenHash`); the raw value lives only in the client's httpOnly
cookie. On each use it is **rotated**: the presented token is revoked and a new one issued,
with lineage recorded (`ReplacedByTokenId`). Reusing a revoked/rotated token is rejected.

`RefreshTokens` audit columns: `CreatedAtUtc`, `ExpiresAtUtc`, `RevokedAtUtc`,
`CreatedByIp`, `RevokedByIp`, `ReplacedByTokenId`.

## Storage (web)

- **Access token → in memory** (client JS variable). Lost on reload, then silently
  re-obtained via `refresh`.
- **Refresh token → httpOnly, Secure, SameSite cookie** (`mms_rt`, `Path=/api/v1/auth`), so
  JS cannot read or exfiltrate it. `Secure` is set from `Request.IsHttps` — enabled over
  HTTPS (prod), relaxed on plain-http localhost so dev/curl works. Cross-origin dev uses a
  Vite proxy so the cookie is first-party (see `SECURITY.md`).

## Flows

**Register**
```
POST /auth/register {name, phone, city, password, roles[]}
  → validate (password ≥ 8; roles ⊆ {worker,contractor,employer,agent}; admin rejected)
  → 409 if phone already exists
  → hash password, create User + UserRoles, Status = Active
  → 201 { id }        (NO tokens)
```

**Login**
```
POST /auth/login {phone, password}
  → look up by phone; verify password (generic 401 on any failure)
  → 403 if Status != Active
  → issue access token; create refresh token (hash stored)
  → 200 AuthResponse + Set-Cookie mms_rt
```

**Refresh (rotation)**
```
POST /auth/refresh (mms_rt cookie)
  → hash cookie value; find token; 401 if missing / revoked / expired
  → 401 if user missing or Status != Active
  → revoke presented token (RevokedAtUtc, RevokedByIp, ReplacedByTokenId = new)
  → issue new access token + new refresh token
  → 200 AuthResponse + rotated Set-Cookie
```

**Logout**
```
POST /auth/logout (mms_rt cookie)
  → revoke the presented refresh token; clear cookie → 204
```

**Me**
```
GET /auth/me (Authorization: Bearer <access>)
  → 401 if no/invalid token
  → 200 MeDto (id, name, phone, city, avatarColor, isVerified, status, roles[], profiles{})
```

## Authorization model

- The JWT carries **one `role` claim per held role**, so multi-role accounts (e.g. a
  Contractor+Employer) work naturally with `[Authorize(Roles = "Employer,Contractor")]`
  (comma = OR). `RoleClaimType` is configured to `role`.
- **Anonymous by default:** endpoints are open unless decorated `[Authorize]`. The public
  read controllers are unaffected; only `/auth/me` (and future dashboard/write endpoints)
  are protected. This milestone's only protected endpoint is `/auth/me`; role-gated
  enforcement lands with the first write endpoint.
- **Ownership/resource authorization** (only the applicant withdraws their own application;
  only the poster decides) is designed for the write milestone via `IAuthorizationHandler`
  — not built here.
- **Admin** is provisioned only; it cannot be self-registered.

## Account status lifecycle

`AccountStatus`: **Active** (may authenticate) · **Pending** (reserved for future OTP) ·
**Blocked** (moderation suspension) · **Disabled** (deactivated). Login rejects any non-Active
status with `403 auth.account_inactive`. New registrations are `Active` today; when OTP is
introduced they will start `Pending` until verified.

## Development credentials

Every seeded user has the dev-only password **`Password1`** and `Status = Active` (set by
`DevDataSeeder`; never used in production). Example: log in as Ramesh with phone
`98200-12233` / `Password1` to get a Worker+Contractor token.

## Deferred

Frontend authentication integration (in-memory access token, `Authorization` header,
401→refresh→retry, session restore via `refresh`) is **not** part of this milestone — it
follows once the backend is verified.
