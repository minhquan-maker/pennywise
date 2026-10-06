# PennyWise — AI Personal Finance

PennyWise tracks spending and income, plans budgets that know your pace, and forecasts next month — with insights that explain every number. The interface follows a "graphite + mint" design language (neutral graphite surfaces, a soft mint accent, heavy condensed display type, pill controls and a glowing ring motif). It supports USD and VND and works on desktop and phones (installable to the iPhone home screen; a native iOS app is next).

All smart features run on PennyWise's own **finance engine**, so they work without any API key. When `GROQ_API_KEY` is set, an LLM additionally rewrites summaries, insights and explanations in natural language; every response is tagged `source: "ai" | "engine"`.

## Features

- **Cash flow** — expenses *and* income, net balance, savings rate
- **Transactions** — two-tap add/edit sheet, grouped by day with day totals, search (notes + category), type and category filters, undo on delete, month-scoped clear, CSV export
- **Budgets** — per-category limits with a pace marker, month-end projection, "at risk" status, safe-to-spend per day, suggested budgets you review before applying, copy from last month
- **Dashboard** — net cash flow, 0–100 financial health score, spending-pace chart, category donut, recent activity, budget health, insights, monthly summary
- **Analytics** — 3/6/12-month income vs spending, next-month forecast with likely range, category changes vs the same period last month, weekday spending pattern
- **Settings** — profile and currency, password change, category create/edit (icon, colour, expense/income), export, clear data, account deletion
- **Demo mode** — one click creates a throwaway account with 6 months of realistic data (expires after 24h)
- Responsive layout with a desktop sidebar and an iOS-style bottom tab bar on phones; keyboard shortcut **N** adds a transaction

## How the numbers are calculated

All algorithms live in `backend/src/services/finance.engine.ts` and are unit-tested (`npm test` in `backend/`).

| Feature | Method |
| --- | --- |
| Next-month forecast | Least-squares trend line blended 50/50 with a linearly weighted moving average over complete months plus this month's projection; ~80% band from the residual standard deviation (never narrower than ±10%) |
| Month-end projection | Daily run-rate blended with the historical monthly average using weight *(days elapsed / days in month)²*; run-rate capped at 2× a typical month so one early payment (rent) can't dominate |
| Budget suggestions | Per category: 0.6·WMA + 0.4·median of up to 6 months; categories trending up >5%/month are held at that level, others get a 5% savings nudge; rounded up to readable numbers |
| Budget status | *Over* when spent > limit; *at risk* when ≥80% used, or ahead of an even pace **and** projected over the limit |
| Health score | Savings rate (40 pts) + budget adherence (35) + spending trend vs last month (25) |
| Insights | Ranked rules: overspent/at-risk budgets, spending > income, savings rate, largest category increase, category concentration, weekend share, month-over-month drop |
| Comparisons | For the running month, changes are measured against the *same days* of last month |

All calendar math is done in UTC: a transaction's date is stored as UTC midnight of the day the user picked, so it never shifts across time zones.

## Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query, Recharts, Zustand, Sonner, Lucide
- Backend: Express, TypeScript, Prisma, SQLite, JWT, bcryptjs
- AI (optional): Groq API, `llama-3.3-70b-versatile`

## Project Structure

```text
pennywise/
├── frontend/src/
│   ├── components/   # layout (app shell, auth shell), ui kit, charts
│   ├── hooks/        # centralized TanStack Query hooks + scroll reveal
│   ├── lib/          # axios client, API services, formatting utils
│   ├── pages/        # landing, auth, dashboard, transactions, budget, analytics, settings
│   ├── stores/       # auth + UI (transaction sheet) stores
│   └── types/
├── backend/
│   ├── prisma/       # schema
│   └── src/
│       ├── lib/          # prisma client, UTC date helpers
│       ├── routes/       # REST API
│       ├── services/     # finance engine, analytics, AI, demo data, CRUD services
│       └── middleware/
└── docs/             # plans and design notes
```

## Local Setup

Requires Node.js 20+.

```bash
# 1. API (http://localhost:3000)
cd backend
cp .env.example .env        # set JWT_SECRET; GROQ_API_KEY is optional
npm install
npx prisma db push
npm run dev

# 2. Web app (http://localhost:5173) — in a second terminal
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` to `localhost:3000`, so `VITE_API_URL` is only needed when the API lives elsewhere. Open the app and press **Try the live demo**, or register an account (default expense and income categories are created automatically).

## Environment Variables

### Backend

| Variable | Purpose | Default |
| --- | --- | --- |
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |
| `JWT_SECRET` | JWT signing secret (required) | — |
| `GROQ_API_KEY` | Optional: LLM wording for summaries, insights and explanations | empty → engine only |
| `PORT` | API port | `3000` |
| `ALLOWED_ORIGINS` | Comma-separated frontend origins for CORS | localhost Vite origins |

### Frontend

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_URL` | Backend API base URL | `/api` |

Never commit `.env` files or API keys.

## Deploy

**API (Railway, Render, Fly — any host with a persistent disk):** `backend/Dockerfile` builds the API and runs `npm run start:prod`, which applies the Prisma schema (`prisma db push`) and starts the server. Mount a volume at `/data` (the image sets `DATABASE_URL=file:/data/pennywise.db`) and set `JWT_SECRET`, `ALLOWED_ORIGINS` (your frontend URL) and optionally `GROQ_API_KEY`. `backend/railway.json` configures the health check at `/api/health`.

Without Docker: `npm ci && npm run build && npm run start:prod`.

**Web (Vercel):** import the repo with root directory `frontend/` (framework: Vite). Set `VITE_API_URL=https://<your-api-host>/api`. `frontend/vercel.json` rewrites all routes to the SPA.

## API Reference

All protected endpoints require `Authorization: Bearer <token>`. Errors return `{ error: string }`.

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account (seeds default categories) |
| `POST` | `/api/auth/login` | Sign in (throttled after repeated failures) |
| `POST` | `/api/auth/demo` | Create a demo account with 6 months of data |
| `GET` | `/api/auth/me` | Current user |
| `PUT` | `/api/auth/me` | Update name / currency |
| `PUT` | `/api/auth/password` | Change password `{ currentPassword, newPassword }` |
| `DELETE` | `/api/auth/me` | Delete the account and all data |

### Categories

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/categories` | List categories (expense + income) |
| `POST` | `/api/categories` | Create `{ name, icon, color, type }` |
| `PUT` | `/api/categories/:id` | Update name / icon / color |
| `DELETE` | `/api/categories/:id` | Delete a custom category without transactions |

### Transactions

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/transactions?month=&category=&type=&search=&limit=` | List; `search` matches notes and category names |
| `POST` | `/api/transactions` | Create `{ categoryId, amount, date: "YYYY-MM-DD", note? }`; type follows the category |
| `PUT` | `/api/transactions/:id` | Update |
| `DELETE` | `/api/transactions/:id` | Delete |
| `DELETE` | `/api/transactions/clear?month=` | Delete one month (or everything without `month`) |

### Budgets

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/budgets?month=` | List |
| `PUT` | `/api/budgets` | Upsert `{ categoryId, amount, month }` |
| `POST` | `/api/budgets/bulk` | Upsert many `{ month, items: [{ categoryId, amount }] }` |
| `POST` | `/api/budgets/copy` | Copy missing budgets from the previous month `{ month }` |
| `DELETE` | `/api/budgets/:id` | Delete |
| `DELETE` | `/api/budgets/clear?month=` | Delete one month (or everything) |

### Analytics, AI and Export

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/analytics/dashboard?month=YYYY-MM` | Totals, categories, daily series, budgets, projection, health score, insights |
| `GET` | `/api/analytics/trend?months=6` | `{ trend, weekday }` — income/expense per month and weekday averages |
| `GET` | `/api/analytics/forecast` | Next-month forecast with range |
| `GET` | `/api/ai/status` | Whether an LLM is configured |
| `POST` | `/api/ai/summary` | Monthly summary `{ month }` |
| `POST` | `/api/ai/suggest-budget` | Budget suggestions `{ month }` |
| `POST` | `/api/ai/insight` | Three insights `{ month }` |
| `POST` | `/api/ai/predict` | Forecast + explanation |
| `GET` | `/api/export/csv?month=` | CSV download (UTF-8 with BOM) |

## Development Checks

```bash
cd backend && npm test && npx tsc --noEmit && npm run build
cd ../frontend && npx tsc -b && npm run lint && npm run build
```

## Design System

| Token | Value |
| --- | --- |
| Background | `#0B0C0F` |
| Surface / 2 / 3 | `#121418` / `#191B20` / `#20232A` |
| Line / strong | `#262A31` / `#353A44` |
| Accent (mint) | `#3DD9A0` |
| Cream section | `#F1F0E8` |
| Text primary / secondary / tertiary | `#F3F4F6` / `#A3A9B5` / `#6C7380` |
| Display font | Anton (uppercase) |
| Body font | Inter |

Chart and category colours follow a categorical order validated for colour-vision deficiency on the dark surface.

## Roadmap

See `docs/plan-2026-10-redesign.md`. Next: native iOS app on the same API, recurring transactions, CSV import, refresh tokens and push budget alerts.

## License

MIT — built by Nguyen Minh Quan.
