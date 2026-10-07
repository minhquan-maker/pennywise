# PennyWise — AI Personal Finance

PennyWise tracks spending and income, plans budgets that know your pace, and forecasts next month — with insights that explain every number. The interface follows a "forest + lime" design language inspired by Wise (a clean white canvas, deep forest-green sections, a single lime accent, block-letter display type and pill controls). It supports USD and VND and works on desktop and phones (installable to the iPhone home screen; a native iOS app is next).

All smart features run on PennyWise's own **finance engine**, so they work without any API key. When `GROQ_API_KEY` is set, an LLM additionally rewrites summaries, insights and explanations in natural language; every response is tagged `source: "ai" | "engine"`.

## Features

- **Cash flow** — expenses *and* income, net balance, savings rate
- **Transactions** — two-tap add/edit sheet, grouped by day with day totals, search (notes + category), type and category filters, undo on delete, month-scoped clear, CSV export
- **Budgets** — per-category limits with a pace marker, month-end projection, "at risk" status, safe-to-spend per day, suggested budgets you review before applying, copy from last month
- **Dashboard** — net cash flow, 0–100 financial health score, spending-pace chart, category donut, recent activity, budget health, insights, monthly summary
- **Analytics** — 3/6/12-month income vs spending, next-month forecast with likely range, category changes vs the same period last month, weekday spending pattern
- **Settings** — profile and currency, password change, category create/edit (icon, colour, expense/income), export, clear data, account deletion
- **Landing page** — product overview, live-demo button, FAQ and a **Contact** form (stored in the database and optionally forwarded to Slack/Discord)
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
- Backend: Express, TypeScript, Prisma, PostgreSQL (Neon), JWT, bcryptjs
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
│   ├── prisma/       # schema + migrations
│   └── src/
│       ├── lib/          # prisma client, UTC date helpers
│       ├── routes/       # REST API
│       ├── services/     # finance engine, analytics, AI, demo data, CRUD services
│       └── middleware/
└── docs/             # plans and design notes
```

## Local Setup

Requires Node.js 20+ and Docker (for a local PostgreSQL).

```bash
# 0. Database (PostgreSQL on localhost:5432)
docker compose up -d db

# 1. API (http://localhost:3000)
cd backend
cp .env.example .env        # set JWT_SECRET; GROQ_API_KEY is optional
npm install
npx prisma migrate dev      # creates the tables
npm run dev

# 2. Web app (http://localhost:5173) — in a second terminal
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` to `localhost:3000`, so `VITE_API_URL` is only needed when the API lives on another domain. Open the app and press **Try the live demo**, or register an account (default expense and income categories are created automatically).

Schema changes: edit `backend/prisma/schema.prisma`, then `npx prisma migrate dev --name <change>` and commit the new folder in `prisma/migrations/`.

## Environment Variables

### Backend

| Variable | Purpose | Default |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection (pooled on Neon) | local docker-compose DB |
| `DATABASE_URL_UNPOOLED` | Direct PostgreSQL connection, used for migrations | local docker-compose DB |
| `JWT_SECRET` | JWT signing secret (required) | — |
| `GROQ_API_KEY` | Optional: LLM wording for summaries, insights and explanations | empty → engine only |
| `PORT` | API port (ignored on Vercel) | `3000` |
| `ALLOWED_ORIGINS` | CORS origins, `*` wildcard allowed — only needed when the web app is on a different domain | localhost Vite origins |
| `CONTACT_WEBHOOK_URL` | Optional Slack/Discord incoming webhook for contact-form messages | empty |

### Frontend

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_URL` | Backend API base URL — leave unset on Vercel (same domain) | `/api` |
| `VITE_CONTACT_EMAIL` | Optional email shown in the Contact section | empty |

Never commit `.env` files or API keys.

## Deploy (Vercel, one project)

The root `vercel.json` deploys both apps as **Vercel Services** on one domain: `/api/*` goes to the Express backend (a serverless function), everything else to the Vite frontend. No CORS or `VITE_API_URL` is needed.

1. **Merge to `main`** (Vercel builds the branch you import).
2. **New Project → import `minhquan-maker/pennywise`.** Keep Root Directory `./`; Vercel reads `vercel.json` and shows the *Services* preset with `backend` and `frontend`.
3. **Add a database:** Project → *Storage* → *Create Database* → **Neon (Postgres)** → connect it to the project. This sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED` automatically.
4. **Environment variables:** `JWT_SECRET` = a long random string (e.g. `openssl rand -hex 32`). Optional: `GROQ_API_KEY`, `CONTACT_WEBHOOK_URL`, `VITE_CONTACT_EMAIL`.
5. **Deploy.** The backend build runs `prisma migrate deploy`, so tables are created on the first deploy.
6. **Smoke test:** open `https://<project>.vercel.app/api/health` (should return `{"status":"ok"}`), then the site → **Try the live demo** → add a transaction → send a Contact message.

If the database is connected after the first deploy, redeploy once so the migration runs. Until a database and `JWT_SECRET` exist, the build still succeeds (migrations are skipped with a warning) and `/api/health` reports what is missing.

Contact messages are stored in the `ContactMessage` table (browse with `npx prisma studio` or Neon's console) and forwarded to `CONTACT_WEBHOOK_URL` when set.

**Alternative (any Docker host):** `backend/Dockerfile` builds the API and `npm run start:prod` runs `prisma migrate deploy` then starts it; point `DATABASE_URL`/`DATABASE_URL_UNPOOLED` at any PostgreSQL. Host the frontend separately with `VITE_API_URL` and `ALLOWED_ORIGINS` set.

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
| `POST` | `/api/contact` | Public contact form `{ name, email, topic, message }` (rate-limited) |

## Development Checks

```bash
cd backend && npm test && npx tsc --noEmit && npm run build
cd ../frontend && npx tsc -b && npm run lint && npm run build
```

## Design System

| Token | Value |
| --- | --- |
| Background / surface | `#FFFFFF` |
| Wells (surface-2 / Fog) | `#F4F5F2` / `#E8EBE6` |
| Line / strong | `#E2E5DF` / `#C8CCC4` |
| Forest Ink (dark sections, nav) | `#163300` |
| Lime Voltage (accent fill) | `#9FE870` |
| Linen Mist (tints) | `#E2F6D5` |
| Positive ink | `#2F5711` |
| Text primary / secondary / tertiary | `#0E0F0C` / `#454745` / `#6A6C6A` |
| Display font | Inter Tight 900 (uppercase) |
| Body font | Inter |

Chart and category colours follow a categorical order validated for colour-vision deficiency on the white surface.

## Roadmap

See `docs/plan-2026-10-redesign.md`. Next: native iOS app on the same API, recurring transactions, CSV import, refresh tokens and push budget alerts.

## License

MIT — built by Nguyen Minh Quan.
