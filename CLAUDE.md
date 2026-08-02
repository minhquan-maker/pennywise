# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered personal finance tracker. Track expenses, set budgets, and get Groq AI insights. Dark theme with lime green accents.

## Development Commands

```bash
# Backend (runs on :3000)
cd backend && npm install && npx prisma generate && npm run dev

# Frontend (runs on :5173)
cd frontend && npm install && npm run dev

# Database tools (from backend/)
cd backend && npx prisma studio    # Visual DB editor
cd backend && npx prisma db push   # Push schema changes
cd backend && npx prisma db seed  # Seed default categories

# Type check
cd frontend && npx tsc --noEmit
cd backend && npx tsc --noEmit
```

## Environment Variables

**Backend `backend/.env`**:
- `DATABASE_URL=file:./dev.db` — SQLite path
- `JWT_SECRET` — JWT signing secret
- `GROQ_API_KEY` — Groq API key (get from console.groq.com). Without this, AI features return errors.
- `PORT=3000`
- `ALLOWED_ORIGINS` — comma-separated CORS origins (default: `http://localhost:5173,http://localhost:4173`)

**Frontend `frontend/.env`**:
- `VITE_API_URL=http://localhost:3000/api`

## Architecture

### Frontend

- **Framework:** React 19 + Vite + TypeScript + React Router v6
- **Styling:** Tailwind CSS v4 with CSS variables (theme in `frontend/src/index.css`). Design tokens: lime green primary (`#BFFF00`), dark neutral backgrounds.
- **State:** Zustand (auth store only) + TanStack Query (all server state)
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

Query hooks are centralized in `frontend/src/hooks/useQueries.ts`. Import from there, do NOT create inline hooks.

**Routing:** `App.tsx` sets up `QueryClientProvider` → `BrowserRouter` → `Toaster` (sonner) → `ProtectedRoute`. `ProtectedRoute` checks `useAuthStore` token; redirects to `/login` if absent. `AppLayout` provides sidebar navigation.

### Backend

- **Framework:** Express + TypeScript (tsx for dev) + Prisma
- **Database:** SQLite (`backend/prisma/dev.db`)
- **Auth:** JWT (jsonwebtoken). Middleware at `src/middleware/auth.middleware.ts` attaches `req.userId`.
- **AI:** Groq API (`llama-3.3-70b-versatile`) via `src/services/ai.service.ts`. Requires `GROQ_API_KEY` env var.
- **Error handling:** Global `errorHandler` middleware — all errors return `{ error: string }`.

### API Design

All routes under `/api`. Response shape on error: `{ error: string }`. Success responses return data directly (no wrapper). Protected routes require `Authorization: Bearer <token>` header.

**Auth routes:**
- `POST /api/auth/register` → `{ token, user }`
- `POST /api/auth/login` → `{ token, user }`
- `GET /api/auth/me` → `{ user }`
- `PUT /api/auth/me` → `{ user }`
- `DELETE /api/auth/me` → `{ message }`

**Transaction routes:**
- `GET /api/transactions?month=&category=&search=` → `{ transactions }`
- `POST /api/transactions` → `{ transaction }`
- `PUT /api/transactions/:id` → `{ transaction }`
- `DELETE /api/transactions/:id` → `{ message }`
- `DELETE /api/transactions/clear` → `{ message }`

**Budget routes:**
- `GET /api/budgets?month=` → `{ budgets }`
- `PUT /api/budgets` (upsert) → `{ budget }`
- `DELETE /api/budgets/:id` → `{ message }`
- `DELETE /api/budgets/clear` → `{ message }`

**Analytics routes:**
- `GET /api/analytics/dashboard?month=YYYY-MM` → `DashboardData`
- `GET /api/analytics/trend?months=N` → `{ trend }`

**AI routes (all require body `{ month: "YYYY-MM" }` unless noted):**
- `POST /api/ai/summary` → `{ summary }`
- `POST /api/ai/suggest-budget` → `{ suggestions }`
- `POST /api/ai/insight` → `{ insights }`
- `POST /api/ai/predict` (no body) → `{ predicted, changePercent, reason }`

**Export routes:**
- `GET /api/export/csv` → CSV file download

**Category routes:**
- `GET /api/categories` → categories list
- `POST /api/categories` → create category
- `PUT /api/categories/:id` → update category
- `DELETE /api/categories/:id` → delete category

### Data Model (Prisma/SQLite)

`User` → has many `Category`, `Transaction`, `Budget`. `Transaction` and `Budget` belong to a `Category`. Budget has `@@unique([userId, categoryId, month])` — one budget per category per month.

Default categories seeded on first run via `prisma/seed.ts`.

## Design System

- **Primary:** `#BFFF00` (lime green)
- **Background:** `#0A0A0A` (near-black)
- **Card variant:** `variant="dark"` for dark-themed cards, `variant="elevated"` for elevated surfaces.
- **Fonts:** Inter (Google Fonts), loaded via `index.css`.
