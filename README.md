# PennyWise — AI Personal Finance Tracker

> AI-powered personal finance tracker that helps you understand spending habits, set smart budgets, and get intelligent insights — so you save more every month.

[![Platform](https://img.shields.io/badge/Platform-Web-blue?style=flat-square)](https://github.com/minhquan-maker/pennywise)
[![Stack](https://img.shields.io/badge/Stack-React%2019%20%2B%20Vite%20%2B%20Tailwind%20v4-2d3748?style=flat-square&logo=react)](https://github.com/minhquan-maker/pennywise)
[![AI](https://img.shields.io/badge/AI-Groq%20LLM-00a8fc?style=flat-square&logo=rocket)](https://console.groq.com)
[![License](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)](#)

---

## Quick Look

```
PennyWise
├── 🤖 AI Monthly Summaries — Groq-powered spending analysis
├── 📊 Visual Analytics — Spending trends, category breakdowns
├── 💰 Smart Budgets — Per-category limits with AI suggestions
├── ⚡ Quick Add — Floating action button for fast transaction entry
├── 📱 Responsive — Works on desktop, tablet, and mobile
└── 🔐 JWT Auth — Secure, private, self-contained
```

---

## What's Inside

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **TailwindCSS v4** with custom design tokens
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
Fonts       Inter (Google Fonts)
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
│   │   ├── pages/           ← Landing, Dashboard, Transactions, Budget, Analytics, Settings, Auth
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

## Features

### Dashboard
Financial snapshot showing total spent, comparison vs last month, category breakdown pie chart, last 7 days bar chart, and AI-generated monthly summary.

### Transactions
Full CRUD for transactions with search, month filter, and category filter. Quick-add via floating action button with category picker, quick amount chips, and date shortcuts.

### Budget
Set monthly spending limits per category. Visual progress bars show spent vs budgeted. AI suggests budgets based on your spending history.

### Analytics
6-month spending trend chart, category breakdown with progress bars, and AI prediction of next month's spending with reasoning.

### Settings
Update name, currency (USD/VND), export data as CSV, clear all data, or delete account.

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

## Social Links

| Platform | Link |
|----------|------|
| GitHub | [minhquan-maker](https://github.com/minhquan-maker) |
| LinkedIn | [ngminhquan](https://www.linkedin.com/in/ngminhquan/) |
| Portfolio | [minhquan-maker.github.io](https://minhquan-maker.github.io) |

---

## License

MIT — built by [Nguyen Minh Quan](https://github.com/minhquan-maker)
