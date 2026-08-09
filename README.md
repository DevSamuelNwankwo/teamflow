# TeamFlow

A collaborative project & task management SaaS for small software teams — projects, a
drag-and-drop Kanban board, team members, an activity timeline, and a dashboard that actually
summarizes what's going on, in light or dark mode.

**Live demo:** https://teamflow-lime-one.vercel.app
**Demo account:** `demo@teamflow.app` / `TeamFlowDemo123!` (pre-seeded with 4 projects and 10 tasks — see [Seeding demo data](#seeding-demo-data))

## Table of contents

- [Tech stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Database setup](#database-setup)
- [Seeding demo data](#seeding-demo-data)
- [Running locally](#running-locally)
- [Deployment](#deployment)
- [Libraries used](#libraries-used)
- [Known limitations](#known-limitations)

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 (CSS-native `@theme` design tokens, no `tailwind.config.js`) |
| Routing | React Router v7 (SPA/library mode) |
| Server state | TanStack Query v5 |
| Client/UI state | Zustand (theme + sidebar only) |
| Forms/validation | React Hook Form + Zod |
| Drag-and-drop | dnd-kit |
| Charts | Recharts |
| Backend | Supabase (Postgres, Auth, Row Level Security) |
| Deployment | Vercel |

## Features

- **Auth**: register, log in, log out, protected routes, session persistence across refresh,
  handles Supabase projects that require email confirmation
- **Dashboard**: project/task/team stat cards, status-distribution charts, upcoming deadlines,
  recent activity
- **Projects**: full CRUD, status/priority badges, team member assignment, confirm-before-delete
- **Kanban board**: To Do / In Progress / Review / Completed columns, drag-and-drop by mouse
  *and* keyboard (with screen-reader announcements), task CRUD, tags, due dates
- **Team**: every registered user automatically joins the shared workspace; assignments are
  visible on both task and project views
- **Activity timeline**: global feed, per-project feed, and a dashboard widget — driven by real
  mutations, not mock data
- **Search / filter / sort**: on both Projects and Tasks, synced to the URL, with a distinct
  "no results" state vs. a true-empty state
- **Light/dark theme**, persisted, no flash-of-wrong-theme on load
- **Responsive**: verified at 375px / 768px / 1440px — mobile drawer nav, stacked forms, a
  horizontally-scrolling Kanban board on small screens

## Architecture

```
src/
├── api/          # Supabase data-access layer — every table read/write lives here, nowhere else
├── components/
│   ├── ui/       # Button, Modal, ConfirmDialog, StatusBadge, PriorityBadge, FilterBar, …
│   ├── layout/   # AppShell, Sidebar, MobileNav, Header, ThemeToggle
│   ├── dashboard/ projects/ tasks/ team/ activity/   # feature-scoped components
├── pages/        # one component per route
├── routes/       # router.tsx (React.lazy per page), ProtectedRoute
├── hooks/        # TanStack Query hooks per entity (useProjects, useTasks, useActivity, …)
├── contexts/     # AuthContext — wraps the Supabase session
├── stores/       # uiStore.ts (zustand) — theme + sidebar state ONLY, never server data
├── lib/          # constants, validation schemas, filterSort, formatters, toast, chartColors
└── types/        # domain types built on the (hand-written, Supabase-shaped) Database type
supabase/migrations/0001_init.sql   # schema + RLS, versioned as the source of truth
scripts/seed.mjs                     # optional demo-data seeder
```

### Key decisions & trade-offs

**No custom Express/Node backend.** The frontend talks to Supabase directly via
`@supabase/supabase-js`, but every query is centralized in `src/api/*.ts` — components never
call Supabase directly. That data-access layer, plus Postgres Row Level Security, stands in for
what a hand-written API layer would otherwise enforce. Trade-off: business rules live in SQL
policies rather than testable service-layer code, and there's no place for server-only secrets
without adding a small server or Supabase Edge Function later.

**Single shared workspace.** There's no multi-tenant "organization" boundary — every
authenticated user can see and edit every project/task, which matches the brief's "small
software-development team" framing and keeps the RLS policies simple (`to authenticated using
(true)` for reads, ownership checks on insert). Not suitable as-is for multiple unrelated
customer teams on one deployment.

**`profiles` merges the "User" and "TeamMember" concepts.** Supabase Auth's `auth.users` already
owns identity; a separate `TeamMember` table would just duplicate it. Every authenticated user
*is* a team member by definition, created via a Postgres trigger the moment they sign up.

**Activity log is written client-side**, not via a database trigger. Every mutation in
`projectsApi`/`tasksApi` calls a shared `activityApi.log()` right after it succeeds. This lets
activity messages interpolate real names/titles (`"Sarah moved 'Build homepage' to Review"`)
instead of being built inside PL/pgSQL, at the cost of activity being a supplementary trail
rather than the system of record — the one place task/project state itself is written.

**Route-level code splitting.** Each page is `React.lazy`-loaded; heavy per-page dependencies
(Recharts on the dashboard, dnd-kit on the project detail page) never load until that route is
visited. The `Suspense` boundary lives inside `AppShell` around just `<Outlet/>`, so the
sidebar/header don't unmount between page navigations — only the content area shows a spinner.

## Getting started

```bash
git clone https://github.com/DevSamuelNwankwo/teamflow.git
cd teamflow
npm install
```

## Environment configuration

Copy `.env.example` to `.env.local` and fill in your own Supabase project's values (**Project
Settings → API** in the Supabase dashboard):

```bash
cp .env.example .env.local
```

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Only the **anon** key ever belongs in this file (or any `VITE_`-prefixed variable) — anything
prefixed `VITE_` is inlined into the client bundle and shipped to the browser. The service role
key is never used by this app and should never be added here.

## Database setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) once — it creates
   the schema, the profile-bootstrap trigger, and all RLS policies.
3. By default, Supabase requires email confirmation on sign-up. For a quick local demo, either
   confirm the email Supabase sends, or turn it off under **Authentication → Providers → Email**.

## Seeding demo data

Optional, but makes the dashboard/Kanban board worth looking at on first load instead of showing
empty states everywhere:

1. Register the demo account through the app itself (`/register`) — default expected credentials
   are `demo@teamflow.app` / `TeamFlowDemo123!`, or set `SEED_DEMO_EMAIL`/`SEED_DEMO_PASSWORD` env
   vars to use your own. Confirm its email if your project requires it.
2. Run the seed script:
   ```bash
   npm run seed
   ```
   It signs in as that account (using the same anon key + RLS path the app uses — never the
   service role key) and creates 4 projects across every status plus 10 tasks across every
   Kanban column. Safe to re-run — it skips anything that already exists by name.

## Running locally

```bash
npm run dev       # start the Vite dev server
npm run lint       # oxlint
npm run build      # type-check (tsc -b) + production build
npm run preview     # preview the production build locally
```

## Deployment

Deployed to [Vercel](https://vercel.com) as a static SPA:

1. Import the GitHub repo in Vercel (framework preset: Vite).
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Environment Variables in the Vercel
   project settings (same values as `.env.local`).
3. `vercel.json` rewrites every path to `/index.html`, so client-side routes
   (e.g. `/app/projects/:id`) survive a hard refresh instead of 404ing.

## Libraries used

| Library | Why |
|---|---|
| `@supabase/supabase-js` | Postgres + Auth client |
| `@tanstack/react-query` | server-state caching, invalidation, optimistic updates (used for the Kanban drag rollback) |
| `zustand` | tiny client-state store for theme/sidebar — deliberately not used for server data |
| `react-hook-form` + `zod` + `@hookform/resolvers` | form state + schema validation, shared between project/task/auth forms |
| `@dnd-kit/*` | Kanban drag-and-drop with first-class keyboard support (`KeyboardSensor`) |
| `recharts` | the dashboard's status-distribution charts |
| `react-router-dom` | routing, incl. `React.lazy`-friendly route objects |
| `lucide-react` | icon set |
| `sonner` | toast notifications |
| `date-fns` | relative/formatted dates ("Due in 3 days", "2 minutes ago") |
| `clsx` + `tailwind-merge` | conditional Tailwind class composition (`cn()` helper) |

## Known limitations

- **No custom backend** — see [Architecture](#architecture) above for the trade-off this implies.
- **Single shared workspace** — no multi-tenant organization boundary.
- **No automated test suite.** Correctness was validated manually and via scripted browser
  checks (Playwright) against a live Supabase project during development — register/login/
  refresh-persistence, project & task CRUD, Kanban drag by mouse and keyboard with a simulated
  failure + rollback, search/filter/sort, activity logging, theme persistence, and 375/768/1440
  responsive layouts. A deliberate scope trade-off for a project this size; RLS policies and
  task-status mutations would be the highest-value first targets if the project continued.
- **Activity log is client-side write-through** — a crash between the primary write and the log
  write could drop one audit entry. Activity is a supplementary trail, never the source of truth
  for task/project state.
- **Task `position` ordering** is best-effort with no concurrent-edit conflict resolution.
- **"Invited" member status is a data flag**, not a real email-invite system — accounts are still
  created via Supabase Auth's own email/password registration.
