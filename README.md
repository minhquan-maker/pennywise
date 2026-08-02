# PennyWise — AI Personal Finance Tracker

PennyWise is an AI-powered personal finance tracker for recording expenses, managing monthly budgets, understanding spending patterns, and getting practical AI insights. It uses a dark interface with lime accents and supports USD and VND.

## Features

- JWT authentication with bcrypt password hashing
- Expense tracking with categories, notes, dates, search, filters, edit, and delete
- Custom categories with selectable icons and colors
- Monthly budgets with progress and over-budget warnings
- AI budget suggestions based on spending history
- Dashboard spending summary, category donut chart, and seven-day chart
- Six-month analytics trend and AI spending prediction
- CSV export of authenticated transaction data
- Profile and currency settings
- Clear-data and account-deletion confirmations
- Responsive desktop and mobile layout

## Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query, Recharts, Zustand, Sonner, Lucide React
- Backend: Express, TypeScript, Prisma, SQLite, JWT, bcryptjs
- AI: Groq API using `llama-3.3-70b-versatile`

## Project Structure

```text
pennywise/
├── frontend/
│   └── src/
│       ├── components/    # Layout, UI controls, modal, charts
│       ├── hooks/         # Centralized TanStack Query hooks
│       ├── lib/           # Axios client, API services, utilities
│       ├── pages/         # Public, auth, and protected app screens
│       ├── stores/         # Zustand auth store
│       └── types/          # Shared frontend types
├── backend/
│   ├── prisma/            # Prisma schema and local SQLite database
│   └── src/
│       ├── routes/         # REST API routes
│       ├── services/       # Database and AI business logic
│       └── middleware/     # Auth and error middleware
├── SPEC.md
└── README.md
```

## Local Setup

### Prerequisites

- Node.js 18 or newer
- npm
- A Groq API key is optional. Core finance features work without it; AI buttons return an error until a key is configured.

### 1. Configure the backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```

The API runs at `http://localhost:3000`.

Edit `backend/.env` before using AI features:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="use-a-long-random-secret"
GROQ_API_KEY="your-groq-api-key"
PORT=3000
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:4173"
```

### 2. Configure the frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

The frontend template contains:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Create an account

Open the frontend URL, register an account, and start adding transactions. Each new account receives the default categories automatically. Custom categories can be created or deleted from Settings.

## Environment Variables

### Backend

| Variable | Purpose | Default |
| --- | --- | --- |
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |
| `JWT_SECRET` | JWT signing secret | none; set a strong value |
| `GROQ_API_KEY` | Enables AI summaries, suggestions, insights, and prediction | empty |
| `PORT` | API port | `3000` |
| `ALLOWED_ORIGINS` | Comma-separated frontend origins | localhost Vite origins |

### Frontend

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api` |

Never commit `.env` files or API keys. Use the committed `.env.example` files as templates.

## Pages

- `/` — Public product overview and sign-up entry point
- `/about` — Features, workflow, pricing placeholder, and sign-up entry point
- `/login` and `/register` — Authentication
- `/dashboard` — Current-month spending overview and AI summary
- `/transactions` — Search, filter, add, edit, delete, and clear transactions
- `/budget` — Monthly category budgets and AI suggestions
- `/analytics` — Six-month trend, category breakdown, and prediction
- `/settings` — Profile, currency, category management, CSV export, data clearing, and account deletion

## API Reference

All protected endpoints require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account and seed default categories |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/auth/me` | Get the current user |
| `PUT` | `/api/auth/me` | Update profile and currency |
| `DELETE` | `/api/auth/me` | Delete the account and related data |

### Categories

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/categories` | List the user's categories |
| `POST` | `/api/categories` | Create a custom category |
| `PUT` | `/api/categories/:id` | Update a category |
| `DELETE` | `/api/categories/:id` | Delete a category |

### Transactions

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/transactions?month=&category=&search=` | List filtered transactions |
| `POST` | `/api/transactions` | Create a transaction |
| `PUT` | `/api/transactions/:id` | Update a transaction |
| `DELETE` | `/api/transactions/:id` | Delete a transaction |
| `DELETE` | `/api/transactions/clear` | Delete all transactions |

### Budgets

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/budgets?month=` | List budgets |
| `PUT` | `/api/budgets` | Create or update a monthly category budget |
| `DELETE` | `/api/budgets/:id` | Delete a budget |
| `DELETE` | `/api/budgets/clear` | Delete all budgets |

### Analytics, AI, and Export

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/analytics/dashboard?month=YYYY-MM` | Current-month totals and charts |
| `GET` | `/api/analytics/trend?months=6` | Monthly trend data |
| `POST` | `/api/ai/summary` | Generate a monthly summary |
| `POST` | `/api/ai/suggest-budget` | Suggest category budgets |
| `POST` | `/api/ai/insight` | Generate three spending insights |
| `POST` | `/api/ai/predict` | Predict next-month spending |
| `GET` | `/api/export/csv?month=YYYY-MM` | Download authenticated CSV data |

## Development Checks

```bash
cd frontend && npx tsc --noEmit && npm run lint && npm run build
cd ../backend && npx tsc --noEmit && npm run build
```

## Design System

| Token | Value |
| --- | --- |
| Background | `#0A0A0A` |
| Surface | `#171717` |
| Border | `#262626` |
| Accent | `#BFFF00` |
| Accent hover | `#ADFF00` |
| Primary text | `#FFFFFF` |
| Secondary text | `#A3A3A3` |

## License

MIT — built by Nguyen Minh Quan.
