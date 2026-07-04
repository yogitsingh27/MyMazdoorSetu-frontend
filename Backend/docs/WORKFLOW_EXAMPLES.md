# Workflow Examples

End-to-end walkthroughs of the hiring workflow. See `docs/JOB_WORKFLOW.md` for the rules and
`docs/API.md` for full contracts.

**Conventions used below:** every write needs `Authorization: Bearer <accessToken>` obtained
from `POST /auth/login`. Dev seed password is `Password1`. Bodies are JSON. Ownership always
comes from the token — no user id is ever sent.

Seed users referenced: **Meena** (`99100-30912`, Employer), **Grand Crown Hotel**
(`98730-21000`, Employer), **Ramesh** (`98200-12233`, Worker + Contractor), **Anita**
(`96400-44120`, Worker), **Irfan** (`98111-22334`, Worker).

---

## 1. Employer posts → Worker applies → Employer accepts

```
# Meena logs in and posts a job
POST /auth/login              { "phone": "99100-30912", "password": "Password1" }   → token(Meena)

POST /jobs   (Bearer Meena)
{ "title":"Wall plastering, 2BHK", "trade":"Mason", "wage":"₹800/day",
  "location":"Dwarka, Delhi", "duration":"5 days", "description":"…",
  "openings":2, "postedAsRole":"employer" }
→ 201  { "code":"JOB-2334", "status":"open", "openings":2, "postedByRole":"employer", … }

# Anita logs in and applies
POST /auth/login              { "phone":"96400-44120", "password":"Password1" }      → token(Anita)
POST /jobs/JOB-2334/applications   (Bearer Anita)
→ 201  { "id":"<appId>", "jobCode":"JOB-2334", "status":"pending", … }

# Meena reviews applicants and accepts
GET  /jobs/JOB-2334/applications   (Bearer Meena)
→ 200  [ { "id":"<appId>", "applicant":{ "name":"Anita Devi", "trade":"Painter", "rating":5 }, "status":"pending", … } ]

POST /applications/<appId>/accept  (Bearer Meena)
→ 200  { "id":"<appId>", "status":"accepted", … }

# Openings decremented
GET  /jobs/JOB-2334   (anonymous)   → 200  { …, "openings":1 }
```

---

## 2. Worker applies → Withdraws → Reapplies (same row)

```
POST /jobs/JOB-2334/applications   (Bearer Anita)   → 201 { "id":"<appId>", "status":"pending" }

POST /applications/<appId>/withdraw (Bearer Anita)  → 200 { "id":"<appId>", "status":"withdrawn" }

# Re-applying reactivates the SAME row → 200 (not 201), same id
POST /jobs/JOB-2334/applications   (Bearer Anita)
→ 200  { "id":"<appId>", "status":"pending" }        # same <appId>

# A second apply while already pending is rejected
POST /jobs/JOB-2334/applications   (Bearer Anita)
→ 409  { "code":"application.already_applied", … }
```

`Accepted`/`Rejected` are terminal — re-applying after a decision also returns
`409 application.already_applied`. Only a `Withdrawn` application can be reactivated.

---

## 3. Employer rejects an application

```
POST /jobs/JOB-2334/applications   (Bearer Irfan)   → 201 { "id":"<irfanApp>", "status":"pending" }

POST /applications/<irfanApp>/reject  (Bearer Meena)
→ 200  { "id":"<irfanApp>", "status":"rejected", "decidedAt":"…" }

# Irfan cannot re-apply after a decision
POST /jobs/JOB-2334/applications   (Bearer Irfan)   → 409 { "code":"application.already_applied" }
```

Rejecting does **not** change `Openings`. A worker who is not the poster attempting to reject
gets `403 application.forbidden`; a Worker-role token hitting the endpoint at all gets `403`
from the role gate.

---

## 4. Contractor posts using postedAsRole

```
# Ramesh holds Worker + Contractor. He posts *as a contractor*.
POST /auth/login   { "phone":"98200-12233", "password":"Password1" }   → token(Ramesh)

POST /jobs   (Bearer Ramesh)
{ "title":"Shop rewiring", "trade":"Electrician", "wage":"₹1000/day",
  "location":"Noida", "duration":"3 days", "description":"…",
  "openings":1, "postedAsRole":"contractor" }
→ 201  { "code":"JOB-2335", "postedByRole":"contractor", … }
```

If Ramesh had passed `"postedAsRole":"employer"` (a role he does **not** hold) →
`400 request.invalid`. The job's `PostedById` is always Ramesh (from the token); the body only
chooses the *capacity*.

---

## 5. Multi-role user behaviour

Ramesh (Worker + Contractor) can act in both capacities, and ownership rules still hold:

```
# As a Contractor he posts JOB-2335 (above).
# As a Worker he tries to apply to his OWN job → blocked
POST /jobs/JOB-2335/applications   (Bearer Ramesh)
→ 409  { "code":"application.self_apply", … }

# As a Worker he applies to someone else's job → fine
POST /jobs/JOB-2334/applications   (Bearer Ramesh)   → 201 { "status":"pending" }

# He sees his applications (worker view) and his posted jobs (poster view) separately
GET /me/applications  (Bearer Ramesh)   → 200 [ { "jobCode":"JOB-2334", "status":"pending", … } ]
GET /me/posted-jobs   (Bearer Ramesh)   → 200 [ { "code":"JOB-2335", "applicationCount":0, "pendingCount":0, … } ]
```

The same token is accepted by both the Worker-gated and the Contractor-gated endpoints because
the JWT carries **both** role claims; the ownership checks (self-apply block, poster-only
accept/reject) prevent any capacity confusion.

---

## Full job lifecycle (poster)

```
POST /jobs                         → Open       (accepting applications)
POST /jobs/{code}/close            → Closed     (stop new applications; pending still decidable)
POST /jobs/{code}/complete         → Completed  (must be Closed first; decisions now blocked)
```

Attempting `complete` directly on an `Open` job → `409 job.invalid_transition`. Accepting or
rejecting an application once the job is `Completed` → `409 application.job_completed`.
