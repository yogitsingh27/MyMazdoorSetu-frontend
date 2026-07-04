# MyMazdoorSetu API

Source of truth for the HTTP API. The **public read** endpoints (sections 1–5) are
anonymous and side-effect free. The **authentication** endpoints are documented below;
full architecture is in `docs/AUTHENTICATION.md` and security rationale in `docs/SECURITY.md`.

## Conventions

- **Base URL (dev):** `http://localhost:5199` — routes are prefixed `/api/v1`.
- **Property naming:** JSON is **camelCase**.
- **Enums** serialize as lowercase strings: role → `worker` / `contractor` / `employer` / `agent`; job status → `open` / `active` / `completed` / `closed`; availability → `available` / `booked`; employer kind → `homeowner` / `builder` / `company` / `society` / `factory` / `hotel` / `shop`.
- **Dates** are ISO-8601 UTC strings (e.g. `2026-06-13T00:00:00Z`).
- **Derived fields** (`rating`, `posterRating`, `reviewCount`, `jobsDone`, `jobsPosted`, `currentlyHiring`) are computed on read from reviews / applications; they are never stored. A subject with no reviews has `rating: 0`.
- **Errors** use RFC 7807 `application/problem+json` with a machine-readable `code` (see [Error format](#error-format)).
- **CORS:** the dev origin `http://localhost:5173` is allowed.

---

## Authentication

Phone + password. Login issues a short-lived JWT **access token** (Bearer, ~30 min, sent in
the response body) plus a rotating **refresh token** delivered as an httpOnly cookie
(`mms_rt`, `Path=/api/v1/auth`). **Registration creates the account only — no tokens**; the
client then logs in. `register`/`login`/`refresh` are rate-limited per IP (429 `auth.rate_limited`).

| Method | Route | Auth | Purpose | Success | Error codes |
|---|---|---|---|---|---|
| POST | `/api/v1/auth/register` | anon | Create account (no tokens) | `201` | 400 `request.invalid`, 409 `auth.phone_taken` |
| POST | `/api/v1/auth/login` | anon | Issue access token + refresh cookie | `200` | 400 `request.invalid`, 401 `auth.invalid_credentials`, 403 `auth.account_inactive` |
| POST | `/api/v1/auth/refresh` | refresh cookie | Rotate refresh + mint new access token | `200` | 401 `auth.invalid_refresh` |
| POST | `/api/v1/auth/logout` | refresh cookie | Revoke the refresh token | `204` | — |
| GET | `/api/v1/auth/me` | Bearer | Current authenticated user | `200` | 401 |

**Register** — body `{ name, phone, city, password (≥8), roles[] }`; `roles` ⊆ `["worker","contractor","employer","agent"]` (admin is rejected). Returns `{ "id": "<guid>" }`.

```
POST /api/v1/auth/register
{ "name": "Asha Rani", "phone": "90000-12345", "city": "Delhi", "password": "Password1", "roles": ["worker"] }
→ 201  { "id": "…" }
```

**Login** — body `{ phone, password }`. Returns `AuthResponse` and sets the `mms_rt` cookie.

```
POST /api/v1/auth/login
{ "phone": "98200-12233", "password": "Password1" }
→ 200
{
  "accessToken": "<jwt>", "tokenType": "Bearer", "expiresAtUtc": "2026-07-04T…Z",
  "user": { "id": "…", "name": "Ramesh Kumar", "phone": "98200-12233", "city": "Delhi",
            "avatarColor": "amber", "isVerified": true, "status": "active",
            "roles": ["worker","contractor"],
            "profiles": { "worker": true, "contractor": true, "employer": false, "agent": false } }
}
Set-Cookie: mms_rt=…; HttpOnly; SameSite=Lax; Path=/api/v1/auth
```

**Refresh** — send the `mms_rt` cookie (no body). Returns a new `AuthResponse`, rotates the cookie, and revokes the presented token. **Reusing a revoked/rotated token returns `401`.**

**Me** — `Authorization: Bearer <accessToken>` → the `MeDto` (same `user` shape as the login response).

The JWT carries `sub` (user id), `name`, and one `role` claim per held role (PascalCase, e.g. `Worker`) — supporting multi-role accounts via `[Authorize(Roles="…")]`.

---

## Hiring workflow (authenticated writes)

All identity/ownership comes from the JWT `sub` — **no endpoint accepts a user id**. Rules and
state machines are in `docs/JOB_WORKFLOW.md`; worked examples in `docs/WORKFLOW_EXAMPLES.md`.

| Method | Route | Auth | Purpose | Success |
|---|---|---|---|---|
| POST | `/api/v1/jobs` | Employer\|Contractor | Create a job (`Open`) | `201` + `Location` |
| POST | `/api/v1/jobs/{code}/close` | poster | Open → Closed | `200` |
| POST | `/api/v1/jobs/{code}/complete` | poster | **Closed → Completed** | `200` |
| POST | `/api/v1/jobs/{code}/applications` | Worker | Apply (or reactivate withdrawn) | `201` / `200` |
| POST | `/api/v1/applications/{id}/withdraw` | applicant | Pending → Withdrawn | `200` |
| POST | `/api/v1/applications/{id}/accept` | poster | Pending → Accepted (decrements openings) | `200` |
| POST | `/api/v1/applications/{id}/reject` | poster | Pending → Rejected | `200` |
| GET | `/api/v1/me/applications` | Worker | My applications | `200` |
| GET | `/api/v1/me/posted-jobs` | Employer\|Contractor | My jobs + application counts | `200` |
| GET | `/api/v1/jobs/{code}/applications` | poster | Applicants for a job | `200` |

**Create job** — body `{ title, trade, wage, location, duration, description, openings (≥1), postedAsRole, tags?[], requirements?[] }`. `trade` must exist in the seeded trades; `postedAsRole` (`employer`/`contractor`) must be a role the caller holds. Returns `JobDto`.

```
POST /api/v1/jobs   (Bearer)
{ "title":"Wall plastering, 2BHK", "trade":"Mason", "wage":"₹800/day",
  "location":"Dwarka, Delhi", "duration":"5 days", "description":"…",
  "openings":2, "postedAsRole":"employer", "tags":["Meals included"], "requirements":["2+ years"] }
→ 201  { "code":"JOB-2334", "title":"…", "trade":"Mason", "status":"open", "openings":2,
         "postedByRole":"employer", "postedAt":"…Z", "tags":[…], "requirements":[…] }
```

**Apply** — no body. `201` for a new application, **`200` when a withdrawn one is reactivated in place** (same `id`). Returns the worker's `MyApplicationDto { id, jobCode, jobTitle, trade, wage, jobStatus, status, appliedAt, decidedAt?, updatedAt }`.

**Accept / Reject** — no body; return the poster's `ApplicantDto { id, jobCode, jobTitle, postedByRole, status, appliedAt, decidedAt?, updatedAt, applicant:{ id, name, trade?, rating } }`. **Accept decrements `openings`**; the job is not auto-closed.

**Write error codes**

| Code | HTTP | When |
|---|---|---|
| `request.invalid` | 400 | invalid body / `postedAsRole` not held / unknown trade |
| `job.forbidden` / `application.forbidden` | 403 | caller is not the owner |
| `job.not_found` / `application.not_found` | 404 | no such job / application |
| `job.invalid_transition` | 409 | illegal job state change (e.g. Complete before Close) |
| `job.not_open` | 409 | applying to a non-open job |
| `application.already_applied` | 409 | duplicate / re-apply after a decision |
| `application.not_pending` | 409 | withdraw/accept/reject on a non-pending application |
| `application.self_apply` | 409 | applying to a job you posted |
| `application.job_completed` | 409 | accept/reject once the job is Completed |

---

## 1. Browse jobs

| | |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/v1/jobs` |
| **Purpose** | Paginated list of **open** jobs for the Jobs Browse page. |
| **Path parameters** | None |
| **Request DTO** | None (read-only) |
| **Response DTO** | `PagedResult<JobSummaryDto>` |
| **Success** | `200 OK` |
| **Errors** | `400 Bad Request` |
| **Error codes** | `request.invalid` |

**Query parameters**

| Name | Type | Default | Notes |
|---|---|---|---|
| `q` | string | — | Free-text; matches title, description, location, trade, wage, tags |
| `trade` | string | — | Exact trade name (e.g. `Mason`) |
| `city` | string | — | Substring match on the job's free-text location |
| `page` | int | `1` | 1-based; must be ≥ 1 |
| `pageSize` | int | `20` | 1–100 |

**Example request**

```
GET /api/v1/jobs?trade=Mason&pageSize=3
```

**Example response** (`200`)

```json
{
  "items": [
    {
      "code": "JOB-2291",
      "title": "Wall plastering, 2BHK flat",
      "trade": "Mason",
      "wage": "₹700–900/day",
      "location": "Dwarka Sector 12, Delhi",
      "duration": "5 days",
      "postedByRole": "employer",
      "posterRating": 4,
      "posterReviewCount": 1,
      "tags": ["Meals included", "Tools provided"]
    }
  ],
  "page": 1,
  "pageSize": 3,
  "totalCount": 2,
  "totalPages": 1
}
```

**Notes** — Only `open` jobs are returned. **Sorting:** `postedAt` descending, then `code` ascending (stable). **Filtering** is additive; unset filters are ignored. `posterRating`/`posterReviewCount` are the poster's Worker→Hirer review aggregate.

---

## 2. Get job detail

| | |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/v1/jobs/{code}` |
| **Purpose** | Full job detail for the Job Detail page, with poster and similar jobs embedded. |
| **Query parameters** | None |
| **Request DTO** | None (read-only) |
| **Response DTO** | `JobDetailDto` |
| **Success** | `200 OK` |
| **Errors** | `404 Not Found` |
| **Error codes** | `job.not_found` |

**Path parameters**

| Name | Type | Notes |
|---|---|---|
| `code` | string | Human-readable job code, e.g. `JOB-2204` |

**Example request**

```
GET /api/v1/jobs/JOB-2204
```

**Example response** (`200`)

```json
{
  "code": "JOB-2204",
  "title": "Tile fitting, bathroom",
  "trade": "Mason",
  "wage": "₹3,500 fixed",
  "location": "Rohini, Delhi",
  "duration": "5 days",
  "description": "Tile fitting for a single bathroom — tiles and adhesive already purchased, fitting and grouting needed.",
  "status": "completed",
  "openings": 1,
  "postedAt": "2026-06-13T00:00:00Z",
  "requirements": ["Experience with bathroom tile fitting", "Own tile cutter"],
  "tags": ["Tools provided"],
  "poster": {
    "id": "4001992d-ba19-4e83-c832-d74635ff9765",
    "displayName": "Apex Builders Pvt Ltd",
    "role": "employer",
    "kind": "builder",
    "verified": true,
    "avatarColor": "navy",
    "rating": 4.5,
    "reviewCount": 2
  },
  "similar": [
    {
      "code": "JOB-2291", "title": "Wall plastering, 2BHK flat", "trade": "Mason",
      "wage": "₹700–900/day", "location": "Dwarka Sector 12, Delhi", "duration": "5 days",
      "postedByRole": "employer", "posterRating": 4, "posterReviewCount": 1,
      "tags": ["Meals included", "Tools provided"]
    }
  ]
}
```

**Notes** — `poster.kind` is present only when the poster is an employer (`null` otherwise). `poster.id` is the user GUID; the client links to the employer profile when `poster.role == "employer"`. **`similar`** is up to 3 other open jobs of the same trade, ordered `postedAt` descending. Requirement/tag order is not guaranteed (an explicit ordering column is a future enhancement).

---

## 3. Browse workers

| | |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/v1/workers` |
| **Purpose** | Paginated list of workers for the Workers Browse page. |
| **Path parameters** | None |
| **Request DTO** | None (read-only) |
| **Response DTO** | `PagedResult<WorkerSummaryDto>` |
| **Success** | `200 OK` |
| **Errors** | `400 Bad Request` |
| **Error codes** | `request.invalid` |

**Query parameters**

| Name | Type | Default | Notes |
|---|---|---|---|
| `q` | string | — | Matches name, city, trade, skills, portfolio |
| `trade` | string | — | Exact trade name |
| `city` | string | — | Exact city name |
| `availability` | string | — | `available` or `booked` (else `400`) |
| `verified` | bool | — | `true` returns only verified workers; absent/`false` returns all |
| `page` | int | `1` | 1-based |
| `pageSize` | int | `20` | 1–100 |

**Example request**

```
GET /api/v1/workers?trade=Painter&verified=true
```

**Example response** (`200`)

```json
{
  "items": [
    {
      "id": "987ae6ff-8f3d-e5df-2441-307c4c6a889a",
      "name": "Ritu Devi",
      "avatarColor": "amber",
      "city": "Gurugram",
      "trade": "Mason",
      "verified": true,
      "rating": 5,
      "jobsDone": 0,
      "skills": ["Brickwork", "Plastering", "Tiling"]
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 2,
  "totalPages": 1
}
```

**Notes** — A "worker" is a user with a worker profile. **Sorting:** verified first, then experience descending, then name. Rating-based ranking is a future enhancement. `rating` and `jobsDone` are derived.

---

## 4. Get worker detail

| | |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/v1/workers/{id}` |
| **Purpose** | Full worker detail for the Worker Detail page, with reviews and similar workers embedded. |
| **Query parameters** | None |
| **Request DTO** | None (read-only) |
| **Response DTO** | `WorkerDetailDto` |
| **Success** | `200 OK` |
| **Errors** | `404 Not Found` |
| **Error codes** | `worker.not_found` |

**Path parameters**

| Name | Type | Notes |
|---|---|---|
| `id` | GUID | User id. A non-GUID value does not match the route → `404`. |

**Example request**

```
GET /api/v1/workers/a838fb54-8d2e-6276-8c08-2d7d9e2ae950
```

**Example response** (`200`, abridged)

```json
{
  "id": "a838fb54-8d2e-6276-8c08-2d7d9e2ae950",
  "name": "Ramesh Kumar",
  "avatarColor": "amber",
  "city": "Delhi",
  "verified": true,
  "trade": "Mason",
  "experienceYears": 9,
  "availability": "available",
  "rating": 5,
  "reviewCount": 1,
  "jobsDone": 1,
  "skills": ["Brickwork", "Plastering", "Tiling"],
  "portfolio": ["Wall plastering, 2BHK flat, Dwarka", "Tile fitting, bathroom renovation"],
  "languages": ["English", "Hindi"],
  "reviews": [
    {
      "id": "7d816759-e828-6531-b686-ced685b8df4f",
      "authorName": "Apex Builders Pvt Ltd",
      "authorLabel": "Employer",
      "date": "2026-06-14T00:00:00Z",
      "overall": 5,
      "verified": true,
      "comment": "Solid tiling work, finished a day early and cleaned up.",
      "categories": [
        { "category": "Work quality", "score": 5 },
        { "category": "Punctuality", "score": 5 },
        { "category": "Communication", "score": 4 },
        { "category": "Safety compliance", "score": 5 }
      ]
    }
  ],
  "similar": [
    {
      "id": "987ae6ff-8f3d-e5df-2441-307c4c6a889a", "name": "Ritu Devi",
      "avatarColor": "amber", "city": "Gurugram", "trade": "Mason",
      "verified": true, "rating": 5, "jobsDone": 0, "skills": ["Brickwork", "Plastering", "Tiling"]
    }
  ]
}
```

**Notes** — **`reviews`** are Hirer→Worker reviews about this worker, newest first; category axes are Work quality / Punctuality / Communication / Safety compliance. `verified: true` means the review is linked to a completed job ("reviewed after completed work"). **`similar`** is up to 3 other workers of the same trade. `jobsDone` = accepted applications on completed jobs. Skill/portfolio/language order is not guaranteed.

---

## 5. Get employer detail

| | |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/v1/employers/{id}` |
| **Purpose** | Full employer detail for the Employer Detail page, with reviews and open jobs embedded. |
| **Query parameters** | None |
| **Request DTO** | None (read-only) |
| **Response DTO** | `EmployerDetailDto` |
| **Success** | `200 OK` |
| **Errors** | `404 Not Found` |
| **Error codes** | `employer.not_found` |

**Path parameters**

| Name | Type | Notes |
|---|---|---|
| `id` | GUID | User id. Returns `404` if the user has no employer profile. |

**Example request**

```
GET /api/v1/employers/962497a8-abba-6cf8-3634-0d65becc7b03
```

**Example response** (`200`, abridged)

```json
{
  "id": "962497a8-abba-6cf8-3634-0d65becc7b03",
  "orgName": "Sharma Residence",
  "kind": "homeowner",
  "city": "Delhi",
  "verified": true,
  "tagline": "Family home renovation in Dwarka — occasional skilled work, fair and direct.",
  "rating": 4,
  "reviewCount": 1,
  "jobsPosted": 4,
  "currentlyHiring": 3,
  "reviews": [
    {
      "id": "cd51c55b-cddb-96f2-0b98-db63870b177b",
      "authorName": "Suresh Yadav",
      "authorLabel": "Worker · Plumber",
      "date": "2026-06-10T00:00:00Z",
      "overall": 4,
      "verified": true,
      "comment": "Fair and respectful; payment a day late but informed in advance.",
      "categories": [
        { "category": "Payment reliability", "score": 4 },
        { "category": "Site safety", "score": 4 },
        { "category": "Communication", "score": 5 },
        { "category": "Fair treatment", "score": 4 }
      ]
    }
  ],
  "openJobs": [
    {
      "code": "JOB-2291", "title": "Wall plastering, 2BHK flat", "trade": "Mason",
      "wage": "₹700–900/day", "location": "Dwarka Sector 12, Delhi", "duration": "5 days",
      "postedByRole": "employer", "posterRating": 4, "posterReviewCount": 1,
      "tags": ["Meals included", "Tools provided"]
    }
  ]
}
```

**Notes** — **`reviews`** are Worker→Hirer reviews about this employer, newest first; category axes are Payment reliability / Site safety / Communication / Fair treatment. **`jobsPosted`** counts jobs posted in the employer capacity; **`currentlyHiring`** counts those still open (= `openJobs.length`). Only jobs posted as employer are included (a multi-role account's contractor-posted jobs are excluded).

---

## Error format

All errors are `application/problem+json`:

```json
{
  "title": "Not Found",
  "status": 404,
  "detail": "No job exists with code 'NOPE'.",
  "code": "job.not_found"
}
```

| Code | HTTP | Meaning |
|---|---|---|
| `request.invalid` | 400 | Invalid query parameter (`page`/`pageSize` out of range, unknown `availability`) |
| `job.not_found` | 404 | No job with the given code |
| `worker.not_found` | 404 | No worker with the given id |
| `employer.not_found` | 404 | No user with an employer profile for the given id |

The `code` is stable and machine-readable; clients localize the user-facing message from it rather than displaying `detail`.

## DTO reference

- **`PagedResult<T>`** — `items: T[]`, `page`, `pageSize`, `totalCount`, `totalPages`.
- **`JobSummaryDto`** — `code`, `title`, `trade`, `wage`, `location`, `duration`, `postedByRole`, `posterRating`, `posterReviewCount`, `tags: string[]`.
- **`JobDetailDto`** — `JobSummaryDto` fields minus poster aggregates, plus `description`, `status`, `openings`, `postedAt`, `requirements: string[]`, `tags: string[]`, `poster: PosterDto`, `similar: JobSummaryDto[]`.
- **`PosterDto`** — `id`, `displayName`, `role`, `kind?`, `verified`, `avatarColor`, `rating`, `reviewCount`.
- **`WorkerSummaryDto`** — `id`, `name`, `avatarColor`, `city`, `trade`, `verified`, `rating`, `jobsDone`, `skills: string[]`.
- **`WorkerDetailDto`** — `WorkerSummaryDto` fields plus `experienceYears`, `availability`, `reviewCount`, `portfolio: string[]`, `languages: string[]`, `reviews: ReviewDto[]`, `similar: WorkerSummaryDto[]`.
- **`EmployerDetailDto`** — `id`, `orgName`, `kind`, `city`, `verified`, `tagline?`, `rating`, `reviewCount`, `jobsPosted`, `currentlyHiring`, `reviews: ReviewDto[]`, `openJobs: JobSummaryDto[]`.
- **`ReviewDto`** — `id`, `authorName`, `authorLabel`, `date`, `overall`, `verified`, `comment`, `categories: { category, score }[]`.
