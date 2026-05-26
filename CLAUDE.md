# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Both apps run concurrently (frontend on :5173, backend on :3000).

```bash
# Backend
cd backend && npm install && npx prisma generate && npm run dev

# Frontend
cd frontend && npm install && npm run dev

# Production build (frontend only)
cd frontend && npm run build
```

After `prisma generate`, restart the backend dev server.

## Architecture

### Dual-repo in one
`frontend/` and `backend/` are independently deployed. The frontend proxies API calls to the backend. Both must run simultaneously during development.

### Frontend — React + Vite + Tailwind v4

**TanStack Query pattern**: All data fetching goes through hook wrappers in `src/hooks/useQueries.ts`. Each mutation auto-invalidates relevant query keys and shows a toast. Do not call `queryClient` directly in page components — extend the hooks instead.

Query keys used:
- `['auth']` — login/register response cache
- `['categories']` — category list
- `['transactions', filters]` — filtered transactions
- `['budgets', month]` — budgets by month
- `['dashboard', month]` — dashboard stats (lazy — `enabled: false`, must `.refetch()`)
- `['trend', months]` — 6-month trend

**Auth store** (`src/stores/auth.store.ts`): Zustand store holding `token` and `user`. Components subscribe with `useAuthStore(s => s.user)`.

**Routing**: `src/App.tsx` — unauthenticated users see LandingPage at `/`, authenticated users go to Dashboard. Protected routes wrapped in `<AppLayout>`. Page transitions use `key={location.pathname}` for fade-in.

**Landing page**: `src/pages/LandingPage.tsx` — public marketing page. On mount, redirects logged-in users to `/dashboard`.

### Backend — Express + Prisma + SQLite

All routes are under `/api/`. Protected routes use `authMiddleware` which attaches `req.userId` from JWT.

**Route files** (`src/routes/`): Each entity has its own router. Middleware is applied at router level with `router.use(authMiddleware)`.

**Service files** (`src/services/`): Business logic lives here, imported by routes.

### Design System — TailwindCSS v4

Design tokens are defined as CSS custom properties in `frontend/src/index.css` under `@theme {}`. **Do not use a `tailwind.config.js` file** — Tailwind v4 reads from `@theme` directly.

Key tokens:
```css
--color-primary-500: #3B82F6 (blue accent)
--color-primary-600: #1D4ED8 (primary action)
--color-surface-0: #FFFFFF  --color-surface-50: #FAFBFC
--color-text-primary: #111827  --color-text-secondary: #6B7280
--shadow-sm/md/lg  --radius-lg/xl/2xl
```

**Animation utilities**: `.animate-stagger` on a parent, `.animate-fade-in` for pages, `.animate-scale-in` for modals. `.skeleton` for loading placeholders.

**Landing page** uses dark theme (inline `#0A0A0A` / `#171717`) and lime green `#BFFF00` accents — these are NOT in the token system, use inline styles.

### Components

UI primitives in `src/components/ui/`: Button (8 variants), Card (4 variants), Input (filled/default), Select, Modal (animated), Badge, Spinner, Skeleton, FloatingActionButton, TransactionModal.

Reusable chart components in `src/components/charts/`: CategoryPieChart, DailyBarChart, TrendLineChart. All accept typed data arrays and use Recharts.

## Key Patterns

### Adding a new page
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx` inside `<ProtectedRoute>`
3. If it needs transactions/budgets/categories, use hooks from `src/hooks/useQueries.ts`
4. If it needs new mutations, add to the same file following the existing pattern

### Adding a new API endpoint
1. Add route in the appropriate `backend/src/routes/` file
2. Add service function in `backend/src/services/`
3. Add service call in `frontend/src/lib/services.ts`
4. Add hook wrapper in `frontend/src/hooks/useQueries.ts`
5. Invalidate relevant query keys on mutation success

### Modal pattern
`TransactionModal` is used by TransactionsPage — it's passed as a separate component, opened by the FloatingActionButton. For page-specific modals, inline them in the page component using the `<Modal>` primitive.

## Database

Prisma schema at `backend/prisma/schema.prisma`. Run `npx prisma studio` to inspect the SQLite database during development.

## Environment

`backend/.env` — never commit this. Required vars: `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`.
`frontend/.env` — `VITE_API_URL=http://localhost:3000/api`
