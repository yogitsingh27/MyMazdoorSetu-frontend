# Seed Data

This document describes the data seeded into the MyMazdoorSetu backend and how the
demo users, jobs, applications, and reviews relate to one another.

## How seeding works

There are two tiers, seeded by two different mechanisms:

| Tier | Data | Mechanism | Environments |
|---|---|---|---|
| **Permanent reference** | Trades, Cities | EF Core `HasData` (baked into the `SeedReferenceData` migration) | **All** (incl. production) |
| **Development / demo** | Users, profiles, jobs, applications, reviews, verification records | `DevDataSeeder` run at startup | **Development only** |

- The `DevDataSeeder` is **idempotent** — it no-ops if any `Users` already exist, so it is safe on every Development startup (see `Program.cs`).
- Demo entities use **deterministic GUIDs** (`DeterministicGuid.For("user:u_ramesh")` etc.), so ids are stable across database resets — useful for tests and demo logins.
- **Derived values are not stored.** Ratings and counts (`jobsDone`, `jobsPosted`, poster rating…) are computed on read from reviews and completed jobs; the seed provides those *inputs*, not the numbers.

## Reference data

**Trades (12):** Mason, Painter, Electrician, Plumber, Carpenter, Supervisor, Welder, Helper, Bar Bender, Tiler, Fabricator, POP Worker.
*(Fabricator and POP Worker are reference-only for now — no demo workers or jobs use them yet.)*

**Cities (6):** Delhi, Noida, Greater Noida, Gurugram, Ghaziabad, Faridabad.

## Demo users (20)

| Slug | Name | Roles | City | Profile detail | Verified |
|---|---|---|---|---|---|
| u_ramesh | Ramesh Kumar | Worker + Contractor | Delhi | Mason worker; "Kumar Works" (business unverified) | ✓ |
| u_anita | Anita Devi | Worker | Delhi | Painter | ✓ |
| u_suresh | Suresh Yadav | Worker | Ghaziabad | Plumber (Booked) | ✓ |
| u_irfan | Irfan Ali | Worker | Noida | Electrician | ✓ |
| u_pooja | Pooja Sharma | Worker | Delhi | Carpenter | ✓ |
| u_deepak | Deepak Verma | Worker | Gurugram | Supervisor (Booked) | ✓ |
| u_vikash | Vikash Yadav | Worker | Ghaziabad | Welder | ✗ |
| u_mahendra | Mahendra Kumar | Worker | Delhi | Helper | ✓ |
| u_ritu | Ritu Devi | Worker | Gurugram | Mason (Booked) | ✓ |
| u_sanjay | Sanjay Kumar | Worker | Noida | Plumber | ✗ |
| u_kavita | Kavita Rani | Worker | Gurugram | Painter | ✓ |
| u_ajay | Ajay Singh | Worker | Ghaziabad | Carpenter (Booked) | ✓ |
| u_faisal | Faisal Khan | Worker | Delhi | Electrician | ✓ |
| u_sunil | Sunil Kumar | Worker | Faridabad | Bar Bender | ✓ |
| u_rekha | Rekha Devi | Worker | Greater Noida | Tiler | ✓ |
| u_apex | Apex Builders | Contractor + Employer | Noida | "Apex Builders Pvt Ltd" (business verified); Employer kind = Builder | ✓ |
| u_meena | Meena Sharma | Employer | Delhi | "Sharma Residence"; kind = Homeowner | ✓ |
| u_grand | Grand Crown Hotel | Employer | Gurugram | "Grand Crown Hotel"; kind = Hotel | ✓ |
| u_priya | Priya Nair | Agent | Delhi | Coverage: West & South Delhi | ✓ |
| u_admin | Platform Admin | Admin | Delhi | — | ✓ |

Two workers (Vikash, Sanjay) are intentionally **unverified** to exercise the verified-only filter. Verified users (18) each have one `VerificationRecord` (`Status = Verified`, document type cycling Aadhaar / Voter ID / PAN, placeholder hash — no real KYC number).

## Demo jobs (16)

| Code | Title | Trade | Posted by | As role | City | Status |
|---|---|---|---|---|---|---|
| JOB-2204 | Tile fitting, bathroom | Mason | u_apex | Employer | Delhi | **Completed** |
| JOB-2276 | Interior painting, 3 rooms | Painter | u_grand | Employer | Gurugram | **Completed** |
| JOB-2150 | Bathroom leak repair | Plumber | u_meena | Employer | Delhi | **Completed** |
| JOB-2200 | Debris clearing | Helper | u_grand | Employer | Gurugram | Closed |
| JOB-2291 | Wall plastering, 2BHK | Mason | u_meena | Employer | Delhi | Open |
| JOB-2288 | Electrical rewiring, shop | Electrician | u_ramesh | Contractor | Delhi | Open |
| JOB-2280 | Site supervisor, tower | Supervisor | u_apex | Contractor | Noida | Open |
| JOB-2295 | Bathroom fitting, new flat | Plumber | u_apex | Contractor | Gurugram | Open |
| JOB-2299 | Modular kitchen | Carpenter | u_meena | Employer | Ghaziabad | Open |
| JOB-2305 | Gate and grill welding | Welder | u_apex | Contractor | Noida | Open |
| JOB-2308 | General site helper | Helper | u_ramesh | Contractor | Delhi | Open |
| JOB-2312 | Boundary wall | Mason | u_grand | Employer | Gurugram | Open |
| JOB-2315 | New wiring, 3BHK | Electrician | u_meena | Employer | Ghaziabad | Open |
| JOB-2318 | Exterior painting, villa | Painter | u_apex | Contractor | Noida | Open |
| JOB-2330 | Steel reinforcement, slab | Bar Bender | u_apex | Contractor | Faridabad | Open |
| JOB-2333 | Floor tiling, apartment | Tiler | u_grand | Employer | Greater Noida | Open |

`PostedByRole` always matches a role the poster actually holds — note `u_apex` posts both as Employer (JOB-2204) and as Contractor (the rest), exercising the multi-role poster case.

## Demo applications (10)

| Job | Applicant | Status |
|---|---|---|
| JOB-2204 | u_ramesh | Accepted |
| JOB-2276 | u_anita | Accepted |
| JOB-2150 | u_suresh | Accepted |
| JOB-2291 | u_ritu | Accepted |
| JOB-2288 | u_irfan | Pending |
| JOB-2299 | u_pooja | Pending |
| JOB-2295 | u_sanjay | Pending |
| JOB-2312 | u_ritu | Pending |
| JOB-2318 | u_kavita | Rejected |
| JOB-2315 | u_faisal | Withdrawn |

All four application statuses are represented. `u_ritu` appears twice (Accepted on JOB-2291, Pending on JOB-2312) — different jobs, so the unique `(JobId, ApplicantId)` rule holds. No applicant is the poster of the job they applied to.

## Demo reviews (8)

Each **Completed** job carries a two-sided review pair, both linked to that job (so they read as "verified — reviewed after completed work"):

| Job | Direction | Author → Subject | Overall |
|---|---|---|---|
| JOB-2204 | Worker → Hirer | u_ramesh → u_apex | 5 |
| JOB-2204 | Hirer → Worker | u_apex → u_ramesh | 5 |
| JOB-2276 | Worker → Hirer | u_anita → u_grand | 5 |
| JOB-2276 | Hirer → Worker | u_grand → u_anita | 5 |
| JOB-2150 | Worker → Hirer | u_suresh → u_meena | 4 |
| JOB-2150 | Hirer → Worker | u_meena → u_suresh | 4 |
| — (unlinked) | Hirer → Worker | u_grand → u_ritu | 5 |
| — (unlinked) | Worker → Hirer | u_deepak → u_apex | 4 |

- `Worker → Hirer` reviews score **Payment reliability / Site safety / Communication / Fair treatment**; the subject is always an Employer/Contractor.
- `Hirer → Worker` reviews score **Work quality / Punctuality / Communication / Safety compliance**; the subject is always a Worker.
- The two unlinked reviews have no `JobId` (they read as unverified).

## The relationship chain

For each completed job, the graph is fully consistent:

```
Completed Job ──posted by──► Hirer (Employer/Contractor)
      │
      └──Accepted Application──► Worker
                                   │
      Worker ──Worker→Hirer review (about the Hirer)──► Hirer
      Hirer  ──Hirer→Worker review (about the Worker)──► Worker
      (both reviews reference the same completed Job)
```

This means the **derived** ratings/counts have real inputs: `u_apex`, `u_grand`, and `u_meena` (employers) and `u_ramesh`, `u_anita`, `u_suresh`, `u_ritu` (workers) all have reviews, so their computed ratings are non-empty; `jobsDone` is non-zero for the three workers accepted on completed jobs; `jobsPosted` reflects each employer's Employer-role postings.

## Resetting the seed

The dev data re-seeds automatically on the next Development startup **only if the `Users` table is empty**. To rebuild from scratch:

```
dotnet ef database update 0   # revert all migrations (drops tables)
dotnet ef database update     # re-apply schema + reference data
# then start the app in Development to re-run DevDataSeeder
```

Because ids are deterministic, a rebuilt database produces the exact same GUIDs.
