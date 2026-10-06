# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered personal finance tracker: expenses and income, budgets with pace/projection, forecasts and insights. "Graphite + mint" design (neutral graphite surfaces, soft mint accent, Anton display type), layout language inspired by tomorro.com. Web first; a native iOS app on the same API comes next (see `docs/plan-2026-10-redesign.md`).

## Development Commands

```bash
# Backend (runs on :3000)
cd backend && npm install && npx prisma generate && npm run dev

# Frontend (runs on :5173)
cd frontend && npm install && npm run dev

# Database tools (from backend/)
cd backend && npx prisma studio    # Visual DB editor
cd backend && npx prisma db push   # Push schema changes

# Checks
cd backend && npm test && npx tsc --noEmit     # node:test unit tests for the finance engine
cd frontend && npx tsc -b && npm run lint && npm run build
```

## Environment Variables

**Backend `backend/.env`**:
- `DATABASE_URL=file:./dev.db` — SQLite path
- `JWT_SECRET` — JWT signing secret
- `GROQ_API_KEY` — optional Groq key. Without it every AI endpoint still works using the finance engine (`source: "engine"`); with it the LLM only rewrites wording (`source: "ai"`).
- `PORT=3000`
- `ALLOWED_ORIGINS` — comma-separated CORS origins (default: `http://localhost:5173,http://localhost:4173`)

**Frontend `frontend/.env`**:
- `VITE_API_URL=http://localhost:3000/api`

## Architecture

### Frontend

- **Framework:** React 19 + Vite + TypeScript + React Router v6
- **Styling:** Tailwind CSS v4 tokens in `frontend/src/index.css` `@theme` (`bg`, `surface`, `surface-2/3`, `line`, `line-strong`, `primary-*`, `cream`, `forest`, `text-*`). Use tokens, never raw hex in components. Custom classes (`.display`, `.eyebrow`, `.num`, `.orb`, `.grain`, `.glow-top`) live in `@layer components` so utilities can override them — unlayered rules beat Tailwind utilities.
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

**UI kit** (`components/ui`): `Button` (pill variants), `Card`/`CardHeader`, `Input`/`Select` (`fieldClass`), `Modal` (bottom sheet on phones), `ConfirmDialog` (optional type-to-confirm), `SegmentedControl`, `MonthStepper`, `StatCard`, `ProgressBar` (with pace tick), `ScoreRing`/`Orb`, `EmptyState`, `PageHeader`, `CategoryIcon`, `SourceTag`, `InsightList`, `TransactionModal`. Charts in `components/charts` share `theme.ts`.

**Dates:** transaction dates are calendar days sent as `YYYY-MM-DD` and stored as UTC midnight. Format with `formatDate` (UTC) and get "today" with `todayISO()` (local) — never `new Date().toISOString()` for a day.

**Routing:** `App.tsx` sets up `QueryClientProvider` → `BrowserRouter` → `Toaster` (sonner) → `ProtectedRoute`. `ProtectedRoute` checks `useAuthStore` token; redirects to `/login` if absent. `AppLayout` provides the desktop sidebar, mobile bottom tab bar (center + button), demo banner, the `N` shortcut and the shared `TransactionModal`. App pages are lazy-loaded (Recharts stays out of the landing bundle). `/about` renders the landing page.

### Backend

- **Framework:** Express + TypeScript (tsx for dev) + Prisma
- **Database:** SQLite (`backend/prisma/dev.db`)
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

**Export routes:**
- `GET /api/export/csv` → CSV file download

**Category routes:**
- `GET /api/categories` → categories list
- `POST /api/categories` → create category
- `PUT /api/categories/:id` → update category
- `DELETE /api/categories/:id` → delete category

### Data Model (Prisma/SQLite)

`User` (`isDemo`) → has many `Category`, `Transaction`, `Budget`. `Category.type` and `Transaction.type` are `expense` | `income`; a transaction's type always follows its category (set server-side). Budgets are expense-only. `Transaction` and `Budget` belong to a `Category`. Budget has `@@unique([userId, categoryId, month])` — one budget per category per month.

Default expense + income categories are seeded idempotently by `categoryService.seedDefaultCategories` (on register and on category fetch).

## Design System

- **Palette:** bg `#0B0C0F`, surface `#121418` / `#191B20` / `#20232A`, line `#262A31`, accent mint `#3DD9A0` (`primary-500`), cream `#F1F0E8` for light marketing sections, `forest` `#0D1B17` text on light/mint. Avoid saturated neon or green-tinted surfaces — the user found them too harsh.
- **Type:** Anton via `.display` (uppercase headlines), Inter body, `.num` for tabular figures, `.eyebrow` for small caps labels.
- **Shapes:** pill buttons (`rounded-full`), cards `rounded-[var(--radius-2xl)]`, sheets `--radius-3xl`; glowing ring `Orb`/`ScoreRing`.
- **Charts/categories:** colours from a CVD-validated categorical order (`#3987e5, #d95926, #199e70, #c98500, #d55181, #9085e9`); income `#3DD9A0` vs spending `#d95926`. One y-axis per chart, legend for ≥2 series.
- **Deploy:** API via `backend/Dockerfile` (`npm run start:prod` = `prisma db push` + start, SQLite on a `/data` volume); web on Vercel from `frontend/`.
