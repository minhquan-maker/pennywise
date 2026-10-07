# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered personal finance tracker: expenses and income, budgets with pace/projection, forecasts and insights. "Forest + lime" design after Wise's visual language (white canvas with fog wells and hairlines, Forest Ink for weight and dark sections, Lime Voltage as the single fill accent, ultra-heavy uppercase display type, pills everywhere). Web first; a native iOS app on the same API comes next (see `docs/plan-2026-10-redesign.md`).

## Development Commands

```bash
# Database (PostgreSQL on :5432)
docker compose up -d db

# Backend (runs on :3000)
cd backend && npm install && npx prisma migrate dev && npm run dev

# Frontend (runs on :5173)
cd frontend && npm install && npm run dev

# Database tools (from backend/)
cd backend && npx prisma studio    # Visual DB editor
cd backend && npx prisma migrate dev --name <change>   # Schema change → commit prisma/migrations

# Checks
cd backend && npm test && npx tsc --noEmit     # node:test unit tests for the finance engine
cd frontend && npx tsc -b && npm run lint && npm run build
```

## Environment Variables

**Backend `backend/.env`**:
- `DATABASE_URL` / `DATABASE_URL_UNPOOLED` — PostgreSQL (pooled / direct for migrations); Neon on Vercel sets both
- `JWT_SECRET` — JWT signing secret
- `GROQ_API_KEY` — optional Groq key. Without it every AI endpoint still works using the finance engine (`source: "engine"`); with it the LLM only rewrites wording (`source: "ai"`).
- `PORT=3000`
- `ALLOWED_ORIGINS` — comma-separated CORS origins, `*` wildcard allowed (default: `http://localhost:5173,http://localhost:4173`)
- `CONTACT_WEBHOOK_URL` — optional Slack/Discord webhook for contact messages

**Frontend `frontend/.env`**:
- `VITE_API_URL=http://localhost:3000/api`

## Architecture

### Frontend

- **Framework:** React 19 + Vite + TypeScript + React Router v6
- **Styling:** Tailwind CSS v4 tokens in `frontend/src/index.css` `@theme` (`bg`, `surface`, `surface-2/3`, `line`, `line-strong`, `pebble`, `primary-*`, `forest`, `positive`, `text-*`). Use tokens, never raw hex in components. Custom classes (`.display`, `.eyebrow`, `.num`, `.mark`, `.skeleton`) live in `@layer components` so utilities can override them — unlayered rules beat Tailwind utilities.
- **State:** Zustand (`auth.store`, `ui.store` for the global add/edit transaction sheet) + TanStack Query (all server state)
- **API client:** `frontend/src/lib/axios.ts` — Axios with JWT interceptor (auto-attaches Bearer token) and 401 auto-logout interceptor.

**TanStack Query pattern** — All mutations follow this exact shape:

```ts
const mutation = useMutation({
  mutationFn: service.method,
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ['key'] })  // always invalidate
  },
  onError: () => toast.error('...')
})
```

Query hooks are centralized in `frontend/src/hooks/useQueries.ts`. Import from there, do NOT create inline hooks. Mutations that touch transactions/budgets call `invalidateFinance(qc)` (transactions, dashboard, budgets, trend).

**UI kit** (`components/ui`): `Button` (pill variants), `Card`/`CardHeader` (`default` hairline, `fog` well, `forest` inverted), `Input`/`Select` (`fieldClass`), `Modal` (bottom sheet on phones), `ConfirmDialog` (optional type-to-confirm), `SegmentedControl`, `MonthStepper`, `StatCard`, `ProgressBar` (with pace tick), `ScoreRing`/`Orb`, `EmptyState`, `PageHeader`, `CategoryIcon`, `SourceTag`, `InsightList`, `TransactionModal`. Charts in `components/charts` share `theme.ts`.

**Dates:** transaction dates are calendar days sent as `YYYY-MM-DD` and stored as UTC midnight. Format with `formatDate` (UTC) and get "today" with `todayISO()` (local) — never `new Date().toISOString()` for a day.

**Routing:** `App.tsx` sets up `QueryClientProvider` → `BrowserRouter` → `Toaster` (sonner) → `ProtectedRoute`. `ProtectedRoute` checks `useAuthStore` token; redirects to `/login` if absent. `AppLayout` provides the desktop sidebar, mobile bottom tab bar (center + button), demo banner, the `N` shortcut and the shared `TransactionModal`. App pages are lazy-loaded (Recharts stays out of the landing bundle). `/about` renders the landing page.

### Backend

- **Framework:** Express + TypeScript (tsx for dev) + Prisma
- **Database:** PostgreSQL via Prisma (Neon in production, `docker-compose.yml` locally). Migrations in `prisma/migrations`; Vercel's backend build runs `prisma migrate deploy`. Use `mode: 'insensitive'` for text search.
- **Config resilience:** `src/lib/dbEnv.ts` maps `POSTGRES_PRISMA_URL`/`POSTGRES_URL`/`POSTGRES_URL_NON_POOLING` aliases onto `DATABASE_URL(_UNPOOLED)`. Missing DB or `JWT_SECRET` → every endpoint returns 503 with an explanation and `/api/health` reports `misconfigured`; `scripts/vercel-build.mjs` skips migrations (with a warning) when no DB is connected instead of failing the deploy.
- **Entrypoint:** `src/index.ts` exports the Express app (Vercel serverless) and only calls `listen` when `VERCEL` is unset. All routes live on one router mounted at both `/api` and `/`, so it works whether or not the platform strips the prefix. In-memory rate limits are per instance.
- **Auth:** JWT (jsonwebtoken). Middleware at `src/middleware/auth.middleware.ts` attaches `req.userId`.
- **Finance engine:** `src/services/finance.engine.ts` — pure, unit-tested algorithms (forecast, month-end projection, budget suggestions, insights, health score, safe-to-spend). `analytics.service.ts` assembles them; keep new calculations pure and add tests in `finance.engine.test.ts`.
- **Dates:** `src/lib/dates.ts` — all month/day math in UTC.
- **AI:** Groq (`llama-3.3-70b-versatile`) via `src/services/ai.service.ts`, optional. Routes compute the engine answer first and fall back to it on any AI failure.
- **Demo:** `POST /api/auth/demo` creates an `isDemo` user with 6 months of generated data (`demo.service.ts`); demo users expire after 24h.
- **Error handling:** Global `errorHandler` middleware — all errors return `{ error: string }`.

### API Design

All routes under `/api`. Response shape on error: `{ error: string }`. Success responses return data directly (no wrapper). Protected routes require `Authorization: Bearer <token>` header.

**Auth routes:**
- `POST /api/auth/register` → `{ token, user }`
- `POST /api/auth/login` → `{ token, user }`
- `GET /api/auth/me` → `{ user }`
- `PUT /api/auth/me` → `{ user }`
- `PUT /api/auth/password` → `{ message }`
- `POST /api/auth/demo` → `{ token, user }`
- `DELETE /api/auth/me` → `{ message }`

**Transaction routes:**
- `GET /api/transactions?month=&category=&type=&search=&limit=` → `{ transactions }`
- `POST /api/transactions` → `{ transaction }`
- `PUT /api/transactions/:id` → `{ transaction }`
- `DELETE /api/transactions/:id` → `{ message }`
- `DELETE /api/transactions/clear?month=` → `{ message, count }`

**Budget routes:**
- `GET /api/budgets?month=` → `{ budgets }`
- `PUT /api/budgets` (upsert) → `{ budget }`
- `DELETE /api/budgets/:id` → `{ message }`
- `POST /api/budgets/bulk` `{ month, items }` → `{ budgets }`
- `POST /api/budgets/copy` `{ month }` → `{ copied, from }`
- `DELETE /api/budgets/clear?month=` → `{ message, count }`

**Analytics routes:**
- `GET /api/analytics/dashboard?month=YYYY-MM` → `DashboardData`
- `GET /api/analytics/trend?months=N` → `{ trend, weekday }`
- `GET /api/analytics/forecast` → forecast with `low`/`high` range

**AI routes (body `{ month: "YYYY-MM" }`, defaults to the current month):**
- `POST /api/ai/summary` → `{ summary }`
- `POST /api/ai/suggest-budget` → `{ suggestions }`
- `POST /api/ai/insight` → `{ insights }`
- `POST /api/ai/predict` (no body) → `{ predicted, low, high, trendPercent, basis, reason, source }`
- All AI responses include `source: "ai" | "engine"`; `GET /api/ai/status` → `{ ai }`

**Contact (public):**
- `POST /api/contact` `{ name, email, topic, message }` → `{ message }` — stored in `ContactMessage`, honeypot `website` field, 5/hour per IP, optional `CONTACT_WEBHOOK_URL` forward

**Export routes:**
- `GET /api/export/csv` → CSV file download

**Category routes:**
- `GET /api/categories` → categories list
- `POST /api/categories` → create category
- `PUT /api/categories/:id` → update category
- `DELETE /api/categories/:id` → delete category

### Data Model (Prisma/PostgreSQL)

`User` (`isDemo`) → has many `Category`, `Transaction`, `Budget`. `Category.type` and `Transaction.type` are `expense` | `income`; a transaction's type always follows its category (set server-side). Budgets are expense-only. `Transaction` and `Budget` belong to a `Category`. Budget has `@@unique([userId, categoryId, month])` — one budget per category per month.

Default expense + income categories are seeded idempotently by `categoryService.seedDefaultCategories` (on register and on category fetch).

## Design System

- **Palette (Wise-inspired, light):** bg/surface `#FFFFFF`, wells `#F4F5F2` / Fog `#E8EBE6`, line `#E2E5DF` / `#C8CCC4`, input border Pebble `#868685`. Forest Ink `#163300` (`forest`) for dark sections, nav and text on lime; Lime Voltage `#9FE870` (`primary-500`) only as a *fill* (primary CTA, active segment/nav, highlights) or as text on forest — never lime text on white; Linen Mist `#E2F6D5` (`primary-100`) for soft tints. "Good/income" ink is `positive` `#2F5711`; text Obsidian `#0E0F0C` / Charcoal `#454745` / Slate `#6A6C6A`; danger `#CB272F`, warning `#A86100`. Flat: no glows, gradients or blurs — rhythm comes from white → mist → forest sections. Keep lime to roughly one element per view.
- **Type:** Inter Tight 900 via `.display` (uppercase, tracking −0.035em, line-height 0.9; stands in for Wise Sans), Inter body, `.num` for tabular figures, `.eyebrow` for small caps labels, `.mark` for a lime highlighter behind one headline word on light surfaces.
- **Icons:** Lucide line icons only — no emoji. Category icons are stored as keys (`utensils`, `bus`, …) from `frontend/src/lib/categoryIcons.ts` and rendered by `CategoryIcon`; legacy emoji values are mapped on read and default categories are upgraded server-side.
- **Shapes:** pill buttons, tabs and tags (`rounded-full`), 10px fields, cards `rounded-[var(--radius-2xl)]` (24px), sheets/feature cards `--radius-3xl` (32px); flat lime coin `Orb`, `ScoreRing`; circular `CategoryIcon`s.
- **Charts/categories:** colours from a CVD-validated categorical order (`#3987e5, #d95926, #199e70, #c98500, #d55181, #9085e9`); income `#7cc84a` vs spending `#d95926` (validated for CVD on white); single-series lines use forest ink over a lime wash. One y-axis per chart, legend for ≥2 series.
- **Deploy:** one Vercel project using Services (root `vercel.json`): `/api/*` → `backend` (Express function), everything else → `frontend` (Vite). The frontend build writes per-route `index.html` shells + `404.html` (`frontend/scripts/spa-routes.mjs`) — add new routes there. `backend/Dockerfile` remains as a non-Vercel alternative.
