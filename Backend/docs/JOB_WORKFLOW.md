# Job & Application Workflow

The authenticated hiring workflow. Endpoint contracts are in `docs/API.md`; worked examples
in `docs/WORKFLOW_EXAMPLES.md`. All identity/ownership is derived from the JWT `sub` — no
endpoint accepts a user id from the client.

## Job lifecycle

```
(create) → Open ──close──▶ Closed ──complete──▶ Completed
```

| State | Meaning |
|---|---|
| **Open** | Accepting applications; appears in public browse. |
| **Closed** | No longer accepting new applications; **pending applicants can still be accepted/rejected**. Not in public browse. |
| **Completed** | Work actually finished. Applications can **no longer** be decided. |
| **Active** | Reserved — not used by the MVP write flow. |

**Transitions**

| Action | From → To | Who | Guard |
|---|---|---|---|
| Create | — → Open | Employer or Contractor | valid body; `postedAsRole` held by caller |
| Close | Open → Closed | the poster | must be Open |
| Complete | **Closed → Completed** | the poster | **must be Closed first** — Completed means finished work, not merely stopped |

Illegal transitions return `409 job.invalid_transition`.

## Application lifecycle

```
(apply) → Pending ──accept──▶ Accepted   (terminal)
             │      ──reject──▶ Rejected   (terminal)
             └──withdraw──▶ Withdrawn ──(re-apply, SAME row)──▶ Pending
```

An application is uniquely identified by **(JobId, ApplicantId)** — one row per worker per
job, enforced by a unique index. Withdraw + re-apply mutate that single row; they never
create a second one.

| State | Meaning |
|---|---|
| **Pending** | Awaiting the poster's decision. |
| **Accepted** | Poster accepted (terminal). |
| **Rejected** | Poster rejected (terminal). |
| **Withdrawn** | Worker withdrew; may re-apply, which reactivates the same row to Pending. |

**Transitions**

| Action | From → To | Who | Guard |
|---|---|---|---|
| Apply | — → Pending (`201`) | Worker | job Open; not the poster; no existing non-withdrawn application |
| Apply (reactivate) | Withdrawn → Pending (`200`) | the applicant | job Open |
| Withdraw | Pending → Withdrawn | the applicant | must be Pending |
| Accept | Pending → Accepted | the job's poster | Pending; job **not Completed** |
| Reject | Pending → Rejected | the job's poster | Pending; job **not Completed** |

## Authorization rules

Two layers — a coarse role gate (`[Authorize(Roles=…)]`) **and** an ownership check in the
service (compared against the JWT `sub`):

| Action | Role gate | Ownership |
|---|---|---|
| Create job | Employer\|Contractor | — (caller is poster) |
| Close / Complete | Employer\|Contractor | caller == `job.PostedById` |
| List posted jobs (`/me/posted-jobs`) | Employer\|Contractor | scoped to caller |
| List job applicants (`GET /jobs/{code}/applications`) | Employer\|Contractor | caller owns the job |
| Apply | Worker | — (caller is applicant) |
| Withdraw | Worker | caller == `application.ApplicantId` |
| List my applications (`/me/applications`) | Worker | scoped to caller |
| Accept / Reject | Employer\|Contractor | caller == `application.Job.PostedById` |

Role failures → `401`/`403` from `[Authorize]`. Ownership failures → **`403`**
(`job.forbidden` / `application.forbidden`).

## Validation rules

- **Create:** `title`, `wage`, `location`, `duration`, `description` required and
  length-bounded; `openings ≥ 1`; `trade` must exist in the seeded `Trades`
  (`400 request.invalid`); `postedAsRole ∈ {employer, contractor}` **and** held by the caller.
  `Code`, `PostedAt`, `Status = Open` are server-set.
- **Apply / Withdraw / Accept / Reject / Close / Complete:** target must exist, pass the
  ownership check, and be in the legal source state (otherwise `404` / `403` / `409`).

## Business rules

- **Accept decrements `Openings`** (floored at 0). The job's status is **not** changed and it
  is **not** auto-closed when openings reach 0 — see Future Considerations.
- **Re-accepting an already-Accepted (or otherwise non-Pending) application** → `409
  application.not_pending`.
- **Deciding on a Completed job** → `409 application.job_completed`.
- **Re-applying after Accepted/Rejected** → `409 application.already_applied` (only a
  Withdrawn application can be reactivated).
- **Self-application** (applying to a job you posted) → `409 application.self_apply`.
- Accept/reject are still permitted while a job is **Closed** (the poster can work through the
  pending queue); they are blocked once **Completed**.

## Error codes

`request.invalid` (400) · `job.not_found` / `application.not_found` (404) ·
`job.forbidden` / `application.forbidden` (403) · `job.invalid_transition` / `job.not_open` /
`application.already_applied` / `application.not_pending` / `application.self_apply` /
`application.job_completed` (409). All are RFC 7807 `application/problem+json` with a `code`.

## Future Considerations

Documented, not implemented now:

- **Optimistic concurrency.** Write operations currently use last-writer-wins. A concurrency
  token (e.g. a `rowversion`) may be added to `Job`/`Application` later so conflicting
  simultaneous writes (two posters, or accept-vs-withdraw races) fail explicitly with `409`
  rather than silently overwriting.
- **Auto-close on fill.** When `Openings` reaches 0 via accepts, the job could auto-transition
  to `Closed`. Deferred so posters keep manual control for now.
- **Pending applications on a completed job.** Completing a job leaves any still-pending
  applications untouched (they simply can no longer be decided). A future pass could
  auto-reject or archive them.
- **Job code generation.** `JOB-NNNN` is derived from the current max suffix, protected by the
  unique index; under heavy concurrent creation a DB sequence would be more robust.
- **Resource-based authorization handlers.** Ownership is currently checked inline in the write
  services; it could migrate to `IAuthorizationHandler` policies if reuse grows.
