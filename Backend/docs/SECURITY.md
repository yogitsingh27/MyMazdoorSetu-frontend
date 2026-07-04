# Security

Security posture and considerations for MyMazdoorSetu. Companion to
`docs/AUTHENTICATION.md` (which covers the auth flows/endpoints).

## Password hashing

- Hashed with **`PasswordHasher<User>`** (ASP.NET Core Identity's hasher, used standalone) —
  **PBKDF2 / HMAC-SHA256, per-user salt, high iteration count**. No home-grown crypto.
- Plaintext passwords are never stored or logged. `User.PasswordHash` holds only the hash
  (nullable — future OTP-only accounts have none).
- **Validation is deliberately lenient** for a low-literacy, daily-wage audience: minimum
  8 characters, non-empty. No forced complexity. Tunable upward later.
- **Login failures are generic** (`401 auth.invalid_credentials`) — the response never
  reveals whether the phone or the password was wrong (anti-enumeration).
- **Future hardening:** migrate to **Argon2id**. Because hashing is centralized in
  `PasswordHasher<User>` and rehash-on-login is supported, this is a localized change.

## JWT lifecycle

- **HS256**, signed with `Jwt:Key`. Short lifetime (**~30 min**) to bound the damage of a
  leaked token, since JWTs are stateless and cannot be individually revoked.
- Validated on every protected request: issuer, audience, lifetime, signature (1-min clock
  skew). Claims are minimal — `sub`, `name`, `jti`, `role[]` — no sensitive PII.
- Configuration: `Jwt:{Key, Issuer, Audience, AccessTokenMinutes, RefreshTokenDays}`.

## Refresh token rotation

- 256-bit random value; **only its SHA-256 hash is persisted** (raw value lives only in the
  client cookie). Lookups are by hash; a DB leak does not expose usable tokens.
- **Rotated on every use:** the presented token is revoked and replaced; lineage is recorded
  (`ReplacedByTokenId`). **A revoked/rotated token cannot be reused** (`401`).
- **Revocable:** logout revokes the current token; a blocked/disabled account fails refresh.
- Audit columns (`CreatedAtUtc`, `ExpiresAtUtc`, `RevokedAtUtc`, `CreatedByIp`,
  `RevokedByIp`, `ReplacedByTokenId`) support investigations.
- **Future hardening:** on detecting reuse of an already-rotated token, revoke the whole
  token family (theft signal). Not implemented in MVP.

## Cookie configuration

The refresh token is delivered as a cookie `mms_rt` with:

- `HttpOnly` — not readable by JavaScript (XSS-resistant).
- `Secure = Request.IsHttps` — enforced over HTTPS (prod); relaxed on plain-http localhost
  so dev/curl works. **Production must be HTTPS.**
- `SameSite=Lax`, `Path=/api/v1/auth` — sent only to the auth endpoints.
- For a cross-origin frontend, use a **Vite dev proxy** so the cookie is first-party; in
  production serve API and app on the same site (or `SameSite=None; Secure`).

## Signing key management

- The `Jwt:Key` in `appsettings.Development.json` is **dev-only** and clearly labelled.
- **Production key must come from a secret store** (environment variable / KMS / vault) and
  **never be committed**. It must be ≥ 256 bits (32+ bytes) for HS256.
- Rotating the key invalidates outstanding access tokens (acceptable — they are short-lived;
  clients refresh). Support for overlapping keys can be added if zero-downtime rotation is
  needed.

## HTTPS requirements

- Production **requires HTTPS**: bearer tokens and the `Secure` refresh cookie must not
  travel over plaintext. `Secure` is derived from the request scheme, so an http deployment
  would silently weaken the cookie — deploy behind TLS.

## Rate limiting

- Built-in ASP.NET Core rate limiter, **fixed window per client IP**, applied to
  `register`, `login`, and `refresh` (the `"auth"` policy). Current limit: **20 requests /
  minute / IP**; exceeding it returns `429 auth.rate_limited` (RFC 7807).
- Deliberately basic — it exists from day one to blunt brute-force/credential-stuffing
  bursts. **Tunable** (tighten per-endpoint, add account-based limits, or a distributed
  store behind a load balancer).

## Future OTP migration strategy

The token layer is auth-method-agnostic, so OTP slots in without reworking JWT/refresh:

1. Add an OTP request/verify step (`/auth/otp/request`, `/auth/otp/verify`) that issues the
   same access + refresh tokens on success.
2. Registration creates a **`Pending`** account; OTP verification flips it to **`Active`**.
3. Password login can remain (dual-mode) or be retired. `PasswordHash` is already nullable
   for OTP-only accounts.

## Account status lifecycle

`AccountStatus` = **Active · Pending · Blocked · Disabled**. Only `Active` may authenticate;
login and refresh both enforce this (`403`/`401`). `Active` is the zero-value so an unset
status safely defaults to Active while `Pending` is only ever stored explicitly. This field
exists now to avoid a schema redesign when moderation/suspension ships.

## Security assumptions

- **Transport:** production is HTTPS end-to-end (incl. any proxy).
- **Signing key secrecy:** the JWT key is secret and stored outside source control in prod.
- **Trust boundary:** the API is the authority; client-side role checks are UX only and
  never a security control.
- **Admin provisioning:** admin accounts are created out-of-band, never self-registered.
- **PII minimization:** tokens carry no sensitive data; KYC document numbers are never
  stored (only a hash — see the data model), and phone numbers are not logged.
- **Not yet in scope (documented for later):** email/verification, password reset,
  MFA/OTP, brute-force lockout, audit-log surfacing, and token-family reuse detection.
