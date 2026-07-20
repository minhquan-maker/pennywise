# PennyWise — AI Personal Finance Tracker

> AI-powered personal finance tracker with a sleek dark interface. Track expenses, set smart budgets, and get intelligent insights powered by Groq AI — so you save more every month.

> [!NOTE]
> This project is in maintenance mode and no longer reflects current active work.
> See [myportfolio](https://github.com/minhquan-maker/myportfolio) or [flood-rescue-cv](https://github.com/minhquan-maker/flood-rescue-cv) for current projects.

[![Platform](https://img.shields.io/badge/Platform-Web-blue?style=flat-square)](https://github.com/minhquan-maker/pennywise)
[![Stack](https://img.shields.io/badge/Stack-React%2019%20%2B%20Vite%20%2B%20Tailwind%20v4-2d3748?style=flat-square&logo=react)](https://github.com/minhquan-maker/pennywise)
[![AI](https://img.shields.io/badge/AI-Groq%20LLM-00a8fc?style=flat-square&logo=rocket)](https://console.groq.com)
[![License](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)](#)

---

## Screenshots

> Landing page and About page feature a bold dark theme with neon lime accents (#BFFF00). All internal app pages (dashboard, transactions, budget, analytics, settings) share the same cohesive design.

---

## What's Inside

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **TailwindCSS v4** with custom dark design tokens
- **Recharts** for data visualization
- **TanStack Query** for data fetching
- **Sonner** for toast notifications
- **Lucide React** for icons

### Backend
- **Express** REST API
- **Prisma** ORM with **SQLite**
- **JWT** authentication
- **bcryptjs** password hashing
- **Groq AI** for summaries, insights, and predictions

---

## Tech Stack

```
Frontend    React 19 · TypeScript · Vite · TailwindCSS v4
Charts      Recharts
Auth        JWT · bcryptjs
Backend     Express · Node.js
Database    Prisma ORM · SQLite
AI          Groq LLM (llama-3.3-70b-versatile)
Icons       Lucide React
Theme       Dark (#0A0A0A) + Lime Green (#BFFF00)
```

---

## Project Structure

```
pennywise/
├── frontend/                 ← React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/     ← CategoryPieChart, DailyBarChart, TrendLineChart
│   │   │   ├── layout/     ← AppLayout (sidebar + content)
│   │   │   └── ui/         ← Button, Card, Input, Select, Modal, Badge, FAB, etc.
│   │   ├── pages/           ← Landing, Dashboard, Transactions, Budget, Analytics, Settings, About
│   │   ├── stores/          ← Auth Zustand store
│   │   ├── hooks/           ← useQueries (TanStack Query hooks)
│   │   ├── lib/             ← API client, utils, services
│   │   └── types/           ← TypeScript interfaces
│   └── package.json
├── backend/                  ← Express API
│   ├── src/
│   │   ├── routes/          ← Auth, Transactions, Budget, Categories, Analytics, AI, Export
│   │   ├── services/         ← Business logic
│   │   ├── middleware/       ← JWT auth middleware
│   │   └── lib/              ← Prisma client, utilities
│   ├── prisma/
│   │   └── schema.prisma     ← Database schema
│   └── package.json
├── SPEC.md                   ← Full specification
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js** 18+
- **npm** or **pnpm**

### 1. Clone the repo

```bash
git clone https://github.com/minhquan-maker/pennywise.git
cd pennywise
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env   # Edit DATABASE_URL and JWT_SECRET
npm install
npx prisma generate
npm run dev
```

The API runs at `http://localhost:3000`.

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite file path | `file:./dev.db` |
| `JWT_SECRET` | Secret for JWT signing | `change-this` |
| `GROQ_API_KEY` | Groq API key for AI features | _(required)_ |
| `PORT` | Server port | `3000` |

Get your Groq API key at [console.groq.com](https://console.groq.com) — free tier available.

---

## Pages & Features

### `/` — Landing Page
Dark hero section with brand messaging, lime green CTA buttons, and a navigation link to sign up or log in.

### `/about` — About Page
Full dark-themed page showcasing all features in a 6-card grid, 4-step how-it-works section, Free/Pro pricing cards, and a call-to-action. Accessible from the sidebar after login.

### `/login` & `/register` — Auth Pages
Dark full-page layout with a brand panel on the left and clean forms on the right. Neon lime "Get Started" buttons.

### `/dashboard` — Dashboard
Financial snapshot: greeting header, stat cards (total spent, vs last month, categories), pie chart, 7-day bar chart, and AI monthly summary with regenerate button.

### `/transactions` — Transactions
Filter bar with search, month picker, and category dropdown. Transaction list with edit/delete on hover. Quick-add via floating action button (lime green FAB) with category picker, quick-amount chips, and date shortcuts.

### `/budget` — Budget
Monthly budget cards with visual progress bars per category. Color-coded status (lime = on track, amber = warning, red = over). "AI Suggest" button auto-populates budgets from spending history.

### `/analytics` — Analytics
6-month spending trend line chart, category breakdown with progress bars, and AI-powered spending prediction with reasoning.

### `/settings` — Settings
Update display name, currency (USD/VND), export data as CSV, clear all data, or delete account.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/auth/me` | Get current user |
| `PUT` | `/api/auth/me` | Update profile |
| `DELETE` | `/api/auth/me` | Delete account |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/transactions` | List transactions (filter by month/category/search) |
| `POST` | `/api/transactions` | Create transaction |
| `PUT` | `/api/transactions/:id` | Update transaction |
| `DELETE` | `/api/transactions/:id` | Delete transaction |
| `DELETE` | `/api/transactions/clear` | Clear all transactions |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/budgets` | List budgets (by month) |
| `PUT` | `/api/budgets` | Create/update budget |
| `DELETE` | `/api/budgets/:id` | Delete budget |
| `DELETE` | `/api/budgets/clear` | Clear all budgets |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/dashboard` | Dashboard data (totals, categories, daily) |
| `GET` | `/api/analytics/trend` | 6-month trend data |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/summary` | Monthly AI summary |
| `POST` | `/api/ai/suggest-budget` | AI budget suggestions |
| `POST` | `/api/ai/insight` | AI insight on a category |
| `POST` | `/api/ai/predict` | Next-month spending prediction |

---

## Design System

| Element | Value |
|---------|-------|
| Background | `#0A0A0A` (near black) |
| Surface | `#171717` (dark card) |
| Border | `#262626` |
| Accent | `#BFFF00` (neon lime) |
| Accent Hover | `#ADFF00` |
| Text Primary | `#ffffff` |
| Text Secondary | `#a3a3a3` |
| Text Tertiary | `#737373` |

---

## Social Links

| Platform | Link |
|----------|------|
| GitHub | [minhquan-maker](https://github.com/minhquan-maker) |
| LinkedIn | [ngminhquan](https://www.linkedin.com/in/ngminhquan/) |
| Portfolio | [minhquan-maker.github.io](https://minhquan-maker.github.io) |

---

## License

MIT — built by [Nguyen Minh Quan](https://github.com/minhquan-maker)
