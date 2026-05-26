# PennyWise — Personal Finance Tracker with AI

> AI-powered personal finance tracker that helps users understand spending habits, set budgets, and get smart insights.

[![Platform](https://img.shields.io/badge/Platform-Web-blue?style=flat-square)](#)
[![Stack](https://img.shields.io/badge/Stack-MERN-olive?style=flat-square)](#)
[![AI](https://img.shields.io/badge/AI-Groq%20(Llama3)-coral?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)](#)

---

## Overview

### What is PennyWise?

A web app that helps you **log daily expenses**, view analytical charts, and uses **AI to analyze** your spending habits.

**Example:** you log "Lunch $2.50", it categorizes as Food and shows on charts. At month end, AI writes: *"You spent $250 this month, most on Food (45%). Consider cutting Entertainment by 20% to save $50."*

### Who uses it?

One person, on a computer or phone, with private data that nobody else can see.

### How it works

```
Sign up → Log expenses → View charts → AI analysis
```

**Data flow diagram:**

```
┌──────────────┐
│  Browser     │   ← What the user sees
│  (Frontend)  │
└──────┬───────┘
       │ HTTP request (with auth token)
       ▼
┌──────────────┐
│  Backend     │   ← Business logic, AI calls
│  (Node.js)   │
└──┬───────┬───┘
   │       │
   ▼       ▼
┌────────┐  ┌─────────┐
│SQLite  │  │ Groq AI │
│(.db)   │  └─────────┘
└────────┘
```

- **Frontend** sends requests to **Backend**
- **Backend** reads/writes **SQLite database**
- **Backend** calls **Groq AI** for analysis, returns results to **Frontend**

### Problem it solves

Most finance apps show *what* you spent — PennyWise shows *why* you spent and *what* to do next.

### Target users

- Individuals who want to track personal spending
- Students and young professionals building financial awareness
- Anyone who wants AI-assisted budget planning without expensive subscriptions

---

## Tech Stack

```
Frontend:  React 19 + Vite + TypeScript + TailwindCSS + Recharts
Backend:   Node.js + Express + TypeScript
Database:  SQLite + Prisma ORM
Auth:      JWT + bcrypt
AI:        Groq API (Llama 3.3 70B, free tier)
Deploy:    Vercel (FE) + Railway (BE)
```

### Why this stack?

| Tool | Reason |
|------|--------|
| **React + Vite** | Fast dev, hot reload, modern DX |
| **TypeScript** | Type safety, better maintainability |
| **TailwindCSS** | Rapid styling, no writing custom CSS |
| **Recharts** | Simple, composable React charts |
| **SQLite + Prisma** | Zero-cost DB, schema migrations, works on edge |
| **Groq API** | Free, fast inference, Llama 3.3 70B |

---

## Features

### Auth
- [x] Register with email + password
- [x] Login with JWT token
- [x] Protected routes (redirect to login if unauthenticated)
- [x] Logout

### Dashboard
- [x] Total spent this month (vs last month, % change)
- [x] Pie chart: spending by category
- [x] Bar chart: last 7 days spending
- [x] AI Monthly Summary card (Groq-powered)

### Transactions
- [x] List all transactions (date, amount, category, note)
- [x] Add new transaction
- [x] Edit transaction
- [x] Delete transaction
- [x] Filter by month
- [x] Filter by category
- [x] Search by note

### Categories
- [x] Default categories: Food, Transport, Shopping, Entertainment, Bills, Health, Other
- [x] Create custom category (name, icon, color)
- [x] Edit category
- [x] Delete category (reassign transactions)

### Budget
- [x] Set monthly budget per category
- [x] Progress bar: spent / budget
- [x] Alert when over budget
- [x] AI Budget Suggestion: "Based on your history, set Food budget at $100"

### AI Features (Groq API)
- [x] **Monthly Summary**: Natural language recap of the month
- [x] **Budget Suggestion**: AI suggests budgets based on spending patterns
- [x] **Spending Insight**: "You spent 45% on Food this month — here's how to reduce"

### Analytics
- [x] Line chart: monthly spending (last 6 months)
- [x] Top spending categories
- [x] Month-over-month comparison
- [x] AI Prediction: "Next month you'll spend ~$300 (up 10%)"

### Settings
- [x] Change display name
- [x] Change currency (USD, VND)
- [x] Export data as CSV
- [x] Delete account

---

## Screens

### `/` — Landing Page
Dark hero with brand headline and CTA. Sign in / sign up buttons in top nav.

### `/about` — About Page
Feature grid (6 cards), 4-step how-it-works, Free/Pro pricing cards, and CTA section. Linked from sidebar "About us" button.

### `/login` — Login Page
Email + password form. Link to register.

### `/register` — Register Page
Name + email + password form. Link to login.

### `/dashboard` — Dashboard (default after login)
- Header: greeting + month/year
- Stats cards: total spent, vs last month
- Pie chart: by category
- Bar chart: last 7 days
- AI Summary card

### `/transactions` — Transactions Page
- Add transaction button (opens modal)
- Filter bar: month picker, category dropdown, search input
- Transaction list: date, category icon, note, amount
- Edit/Delete actions per row

### `/budget` — Budget Page
- Month picker
- Category budget cards with progress bars
- Add/Edit budget modal
- AI Suggest Budget button

### `/analytics` — Analytics Page
- Line chart: 6-month trend
- Category breakdown table
- AI Prediction card

### `/settings` — Settings Page
- Profile form (name, email)
- Currency selector
- Export CSV button
- Delete account (with confirmation)

---

## API Endpoints

```
Auth
  POST /api/auth/register
  POST /api/auth/login
  GET  /api/auth/me
  PUT  /api/auth/me

Transactions
  GET    /api/transactions          ?month=YYYY-MM&category=id&search=q
  POST   /api/transactions
  PUT    /api/transactions/:id
  DELETE /api/transactions/:id

Categories
  GET    /api/categories
  POST   /api/categories
  PUT    /api/categories/:id
  DELETE /api/categories/:id

Budgets
  GET    /api/budgets    ?month=YYYY-MM
  PUT    /api/budgets    (upsert by category+month)
  DELETE /api/budgets/:id

Analytics
  GET    /api/analytics/dashboard    ?month=YYYY-MM
  GET    /api/analytics/trend        ?months=6

AI
  POST   /api/ai/summary             { month }
  POST   /api/ai/suggest-budget      { month }
  POST   /api/ai/insight             { month }
  POST   /api/ai/predict             { month }
```

---

## Database Schema (Prisma)

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  currency     String   @default("USD")
  createdAt    DateTime @default(now())

  transactions Transaction[]
  categories   Category[]
  budgets      Budget[]
}

model Category {
  id           String   @id @default(cuid())
  userId       String
  name         String
  icon         String   @default("$")
  color        String   @default("#6366f1")
  isDefault    Boolean  @default(false)

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  budgets      Budget[]
}

model Transaction {
  id         String   @id @default(cuid())
  userId     String
  categoryId String
  amount     Float
  note       String?
  date       DateTime

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id])
  createdAt  DateTime @default(now())
}

model Budget {
  id         String   @id @default(cuid())
  userId     String
  categoryId String
  amount     Float
  month      String   // "YYYY-MM"

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id])

  @@unique([userId, categoryId, month])
}
```

---

## Project Structure

```
pennywise/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components (Dashboard, Transactions...)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # API client, utils
│   │   ├── types/            # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/
│   ├── src/
│   │   ├── routes/           # Express routes
│   │   ├── middleware/       # Auth, error handling
│   │   ├── services/         # Business logic (AI, analytics)
│   │   ├── lib/             # Prisma client, utils
│   │   └── index.ts         # Entry point
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
└── SPEC.md
```

---

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-key-change-this"
GROQ_API_KEY="gsk_..."
PORT=3000
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:3000/api
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
# → http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Deploy
```bash
# Backend — Railway
# Connect GitHub repo → Railway auto-detects Node.js
# Set env vars: DATABASE_URL, JWT_SECRET, GROQ_API_KEY

# Frontend — Vercel
# Import repo → set VITE_API_URL to your Railway URL
```

---

## AI Prompt Templates

### Monthly Summary
```
You are a financial advisor. Based on spending data for {month}:
- Total spent: {total}{currency}
- Top 3 categories: {categories}
- vs last month: {comparison}

Write a concise 2-3 sentence summary in English, highlighting key patterns and one specific actionable recommendation.
```

### Budget Suggestion
```
Based on this user's spending history:
{history}

Suggest a monthly budget for each category for next month. 
Return a JSON array: [{"category": "Food", "suggestedBudget": 150, "reason": "..."}]
Write reasons in English.
```

### Spending Insight
```
Analyze this month's spending:
- Total: {total}{currency}
- Categories: {category_breakdown}

Give 3 short, actionable insights in English to help reduce spending.
```

### Monthly Prediction
```
Based on 6 months of spending data:
{monthly_totals}

Predict total spending for next month. Return JSON: {"predicted": 320, "change_percent": 8, "reason": "..."}
Write reason in English.
```

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
| Font | Inter (Google Fonts) |

Responsive breakpoints: 640px / 768px / 1024px
