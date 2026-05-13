@AGENTS.md

# Brightboard — Technical Reference for AI Agents

Brightboard is an AI-powered classroom content generator for Australian Foundation (ages 5–6) teachers. Teachers pick a curriculum outcome, choose a resource type (slide deck, infographic, or lesson plan), and the app generates ready-to-use classroom materials via OpenRouter.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6 (App Router) |
| Language | TypeScript |
| Auth + DB | Supabase (`@supabase/ssr` v0.10.3) |
| AI | OpenRouter API (model configurable via admin UI) |
| Styling | Tailwind CSS v4 + custom theme (Nunito font, amber brand) |
| State | Zustand (create wizard only) |
| PDF export | jspdf (client-side, no server route) |
| Deployment | Vercel (auto-deploy from `main`) |

---

## Critical Next.js 16 differences

- **`src/proxy.ts`** — NOT `middleware.ts`. In Next.js 16 the file is `proxy.ts` and the export is `export async function proxy()`. Using `middleware.ts` causes `MIDDLEWARE_INVOCATION_FAILED` on Vercel.
- Always read `node_modules/next/dist/docs/` before touching routing, middleware, or config.

---

## Environment variables

Set in Vercel dashboard AND `.env.local` (gitignored):

```
NEXT_PUBLIC_SUPABASE_URL=https://seqhpncxlnyaebuxwiqx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_P7bnsOrKo8i9kKLNTIPkgA_LJg6TkMQ
SUPABASE_SERVICE_ROLE_KEY=<from supabase dashboard>
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=anthropic/claude-sonnet-4-5   # fallback only; active model stored in DB
ADMIN_EMAILS=peterpolkadot@gmail.com
NEXT_PUBLIC_APP_URL=https://brightboard-navy.vercel.app
```

---

## Database

Single Supabase project shared with other apps — **all tables are prefixed `bb_`**.

| Table | Purpose |
|---|---|
| `bb_profiles` | Auto-created on signup via trigger. Mirrors `auth.users`. |
| `bb_projects` | One row per resource a teacher creates. |
| `bb_slides` | One row per slide within a `slide_deck` project. |
| `bb_resources` | Stores generated content for `infographic` and `lesson_plan` projects. |
| `bb_folders` | Optional folder grouping (structure exists, UI not yet built). |
| `bb_admin_settings` | Key-value store. `active_model` key controls which OpenRouter model is used. |
| `bb_usage_logs` | Every AI call logged with token counts and `cost_usd`. |

All tables have RLS enabled. Users can only see/edit their own rows. Schema SQL is in `supabase-schema.sql`.

### Supabase client rules

- **Server** (`src/lib/supabase/server.ts`): `await createClient()` — async, used in API routes and server components.
- **Browser** (`src/lib/supabase/client.ts`): lazy singleton — call `createClient()` **inside event handlers only**, never in component body or module scope (Supabase validates the URL at construction time and throws during prerender if env vars aren't set yet).

### TypeScript types

`src/types/database.ts` — hand-maintained. Every table definition **must** include `Relationships: []` or `supabase.from()` returns type `never`.

Use the `toJson<T>()` helper (defined inline in API routes) when inserting typed objects into JSONB columns:
```ts
function toJson<T>(val: T): Json { return val as unknown as Json }
```

---

## Auth flow

1. User hits `/login` or `/signup`
2. Clicks "Continue with Google" → `supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: .../auth/callback })`
3. Google redirects to `https://seqhpncxlnyaebuxwiqx.supabase.co/auth/v1/callback`
4. Supabase redirects to `/auth/callback` (route: `src/app/auth/callback/route.ts`)
5. Callback exchanges code for session → redirects to `/dashboard`
6. `src/proxy.ts` protects `/dashboard`, `/create`, `/project/*` — redirects unauthenticated users to `/login`

Email/password signup also exists (sends confirmation email, redirect goes to `/auth/callback`).

---

## Pages

| Route | File | Notes |
|---|---|---|
| `/` | `src/app/page.tsx` | Landing page, `force-dynamic` |
| `/login` | `src/app/login/page.tsx` | Google OAuth + email/password |
| `/signup` | `src/app/signup/page.tsx` | Google OAuth + email/password |
| `/auth/callback` | `src/app/auth/callback/route.ts` | OAuth code exchange |
| `/dashboard` | `src/app/dashboard/page.tsx` | Lists user's projects |
| `/create` | `src/app/create/page.tsx` | Multi-step wizard |
| `/project/[id]` | `src/app/project/[id]/page.tsx` | Project detail + generation UI |
| `/admin` | `src/app/admin/page.tsx` | Admin only (checks `ADMIN_EMAILS`) |

All pages that touch Supabase have `export const dynamic = 'force-dynamic'`.

---

## Create wizard

State managed by Zustand store (`src/stores/create-project.ts`).

Steps: **Year level → Subject → Curriculum outcome → Resource type → Visual style → Finish**

On finish, `create-wizard.tsx` inserts a row into `bb_projects` (status `draft`) and redirects to `/project/[id]`.

Currently locked values: year level = `foundation`, visual style = `bright_cartoon_classroom`. Others show "coming soon".

Curriculum data is hardcoded in `src/data/curriculum.ts` — 11 outcomes (6 science, 5 English, all Foundation).

---

## Generation pipeline

### Slide deck

1. `/project/[id]` renders `ProjectHub` with server-fetched slides (empty on first load).
2. User clicks "Generate plan" in `SlidePlanReview` → POST `/api/generate/plan`
   - Calls `generateSlidePlan()` via OpenRouter
   - Deletes existing `bb_slides` for project, inserts new plan rows (status `pending`)
   - Updates `bb_projects.status` → `generating`
   - **Returns the created `bb_slides` rows** (critical — frontend needs IDs)
3. `onPlanApproved(createdSlides)` in `ProjectHub` stores slides in state, transitions to `generate` phase.
4. `SlideGenerator` shows each slide. User clicks "Generate" per slide → POST `/api/generate/slide`
   - Fetches slide from DB, calls `generateSlideContent()` via OpenRouter
   - Updates slide content in DB, returns updated slide row
5. User clicks "Approve & continue" → PATCH `/api/generate/slide` (status → `approved`)
6. When all slides approved → project status → `complete`, export button appears.
7. "Download PDF" → client-side jspdf generation (no server route), downloads A4 landscape PDF.

### Lesson plan

POST `/api/generate/lesson-plan` → calls `generateLessonPlan()` → upserts into `bb_resources`.

### Infographic

POST `/api/generate/infographic` → calls `generateInfographic()` → upserts into `bb_resources`.

---

## AI layer

`src/lib/ai/generate.ts` — all AI calls go through here.

- Model is read from `bb_admin_settings` (key `active_model`) on every call. Falls back to `OPENROUTER_MODEL` env var.
- Every call logs to `bb_usage_logs` with token counts and cost.
- Image generation (`generateImage()`) is a placeholder — returns `null`. Not yet implemented.

Prompts live in `src/lib/ai/prompts.ts`.

---

## Admin

Route `/admin` — server component checks `isAdminEmail()` (`src/lib/admin/auth.ts`), redirects non-admins.

Tabs: **Users** · **Projects** · **Usage** · **Settings**

Settings tab (`src/components/admin/settings-tab.tsx`) fetches all available models from OpenRouter via `/api/admin/models` and saves the selection to `bb_admin_settings`.

---

## Deployment

- GitHub repo: `peterpolkadot/brightboard`
- Vercel project: `brightboard-navy.vercel.app`
- Auto-deploys from `main` branch
- Branch protection on `main` — push via PR only. Create branch → push → `mcp__github__create_pull_request` → `mcp__github__merge_pull_request` (squash).

---

## Known gaps / not yet built

- Image generation (placeholder, returns null)
- Folder UI (table exists, no UI)
- PDF export for lesson plans and infographics
- Pagination on admin tables
- Year levels beyond Foundation
- Visual styles beyond `bright_cartoon_classroom`
- Full Resource Pack export (button exists, disabled)
