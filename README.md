# MyMazdoorSetu

A labour-marketplace frontend connecting **Workers**, **Contractors (ThekeDar)**, **Employers**, and **Agents**, with an **Admin** console. Built with React + Vite, structured as an API-ready SPA so it can later plug into an ASP.NET Core backend without touching components.

This is **Phase 1 — Architecture & Foundation**. The visual identity is carried over unchanged from the original prototype; what changed is the structure underneath it.

---

## Requirements

- **Node.js 18+** (Node 20 LTS recommended)
- npm 9+ (ships with Node)

## Install & run

```bash
npm install
npm run dev
```

Vite prints a local URL (default `http://localhost:5173`). Open it in your browser.

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## Logging in (mock auth)

There is no backend yet — auth is mocked. On the **Log in** screen, the **Demo accounts** list fills the phone field for you. The accounts demonstrate the role system:

| Phone | Account | Roles |
|---|---|---|
| `98200-12233` | Ramesh | Worker **+** Contractor (multi-role) |
| `98110-55000` | Apex | Contractor **+** Employer (multi-role) |
| `99100-30912` | Meena | Employer only |
| `90040-77654` | Priya | Agent only |
| `90000-00001` | Admin | Admin |

- **Single-role** accounts go straight to their dashboard.
- **Multi-role** accounts land on **Choose your role**, then enter that dashboard.
- Switch roles anytime from the **top-bar switcher** — no logout, the URL changes to `/app/<role>/…`.

---

## Project structure

```
src/
  main.jsx                 App entry — mounts React, BrowserRouter, AppProviders
  App.jsx                  Route tree (public / auth / role-guarded dashboard)

  styles/                  tokens.css + global.css (design system, ported verbatim)
  types/                   roles.js (ROLE enum), models.js (JSDoc API contract)
  data/                    Mock data only — users, jobs, applications, reviews, …
  services/                Promise-based API layer (the swap point for the backend)
  contexts/                Auth, Role, Language, Notification, Theme, Toast + AppProviders
  hooks/                   useServiceData (+ re-exported context hooks)
  config/                  navigation, dashboards, profileTabs — per-role differences as data
  components/
    common/                Icon, Rating, Skeleton, EmptyState, DataTable, Reviews, Primitives
    job/                   JobTicket, JobStatusStepper, PostJobModal
    layout/                Topbar, Sidebar, RoleSwitcher, NotificationBell
  layouts/                 PublicLayout, DashboardLayout (role-aware shell)
  pages/
    public/                Landing, JobsBrowse
    auth/                  LoginPage, RegisterPage, RoleSelectPage
    worker/ contractor/ employer/ agent/ admin/    role dashboards + profiles
    shared/                DashboardHome, MessagesPage, GrievancePage, ProfileShell, NotFound
  router/                  RoleRoute (role guard), RequireAuth
  utils/                   cn, format
```

### How the pieces fit

- **Roles** are defined once in `types/roles.js` (`ROLE` enum). `Customer` was removed and replaced by `Employer`; the contractor key is `contractor` (label "ThekeDar").
- **Multi-role accounts** carry a `roles[]` array. `RoleContext` tracks the *active* role; `RoleRoute` guards `/app/:role/*` so a Worker can never load Employer pages — separation is enforced by routing, not just by hiding links.
- **Per-role differences** (sidebar links, homepage cards, profile tabs) live as **data** in `config/`, rendered by shared layout/dashboard/profile components — five distinct dashboards and profiles without five copies of the code.
- **Services** in `services/` return Promises and read from `data/`. Components consume services, never raw data.

---

## Connecting a real backend (later phase)

Everything funnels through `services/http.js`. To switch from mock data to a live API, replace the mock `respond()` calls inside each service with `fetch` to your ASP.NET Core endpoints — components, contexts, and pages do not change.

```js
// services/http.js  (sketch for the backend phase)
const BASE_URL = import.meta.env.VITE_API_URL;
export async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.status === 204 ? null : res.json();
}
```

Then, e.g. in `services/JobService.js`, `list()` becomes `request('/api/jobs')` instead of `respond(JOBS)`. The data shapes the API should return are documented as JSDoc typedefs in `types/models.js`.

If you host the SPA under a sub-path behind ASP.NET, set Vite's `base` in `vite.config.js` and `BrowserRouter`'s `basename` to match.

---

## Notes & known items

- Path alias `@` → `src` is configured in `vite.config.js` and `jsconfig.json`.
- A few sections present in navigation (e.g. **Payments**, Agent **Applications**) are wired with a clearly-labelled "coming in a later phase" placeholder — the routing and architecture are in place; the screens get built on top of the existing services.
- `data/` is mock data for development only; it is not a database and not for production.

## Tech

React 18 · Vite 5 · React Router 6 · plain CSS (design tokens). No state-management library — React Context is sufficient at this stage.
