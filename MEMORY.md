# PennyWise — Build Progress

> Last updated: 2026-05-25

## Status: PHASE 6-7 IN PROGRESS — All code written, build passes. Smoke test pending.

---

## ✅ Phase 0: Project Initialization
- Backend: package.json, tsconfig.json, Prisma schema, Express skeleton
- Backend: Prisma generated, database pushed (dev.db created)
- Frontend: Vite + React TS scaffold
- Frontend: All deps installed (react-router-dom, zustand, axios, @tanstack/react-query, recharts, tailwindcss v4, sonner)
- Frontend: vite.config.ts with TailwindCSS v4 + path alias @/
- Frontend: index.css with TailwindCSS v4 + design system (Inter font via HTML link)
- Frontend: lib/utils.ts (cn, formatCurrency, formatDate, getCurrentMonth, formatMonth)
- Frontend: lib/axios.ts (Axios instance + auth interceptor + 401 redirect)
- Frontend: types/index.ts
- Frontend: stores/auth.store.ts (Zustand with persist to localStorage)
- Frontend: lib/services.ts (API service layer)
- BUILD: ✅ `npm run build` passes (frontend dist/ created)

## ✅ Phase 1: Backend — Auth
- src/utils/jwt.util.ts (signToken, verifyToken — 7d expiry)
- src/utils/bcrypt.util.ts (hashPassword, comparePassword — 12 rounds)
- src/middleware/auth.middleware.ts (JWT verify, attach userId)
- src/middleware/error.middleware.ts (centralized error handler)
- src/services/user.service.ts (create, findByEmail, findById, update, delete, verifyPassword)
- src/services/category.service.ts (CRUD + seedDefaultCategories — 7 default cats on register)
- src/routes/auth.routes.ts (POST /register, /login, GET /me, PUT /me, DELETE /me)
- TYPECHECK: ✅ Backend `tsc --noEmit` passes

## ✅ Phase 2: Backend — Core API
- src/services/transaction.service.ts
- src/services/budget.service.ts (upsert pattern)
- src/services/analytics.service.ts (getDashboard with category breakdown + last7Days)
- src/routes/category.routes.ts
- src/routes/transaction.routes.ts (GET with month/category/search filters)
- src/routes/budget.routes.ts (GET ?month=, PUT upsert, DELETE)
- src/routes/analytics.routes.ts (GET /dashboard, /trend)
- src/routes/export.routes.ts (GET /csv)
- src/index.ts (Express server with all routes wired)

## ✅ Phase 3: Backend — AI (Groq)
- src/services/ai.service.ts (callGroq with Llama 3.3 70B)
- src/routes/ai.routes.ts (POST /summary, /suggest-budget, /insight, /predict)
- AI prompts in routes matching SPEC.md templates

## ✅ Phase 4: Frontend — UI Components
- components/ui/Button.tsx (variants: primary/secondary/danger/ghost; sizes: sm/md/lg; isLoading)
- components/ui/Input.tsx (label, error, hint; forwardRef)
- components/ui/Select.tsx (label, error; native select)
- components/ui/Modal.tsx (dialog element, portal, backdrop, keyboard close)
- components/ui/Card.tsx (compound: Header, Body, Footer)
- components/ui/Badge.tsx (category badge with icon + color)
- components/ui/Spinner.tsx
- components/layout/AppLayout.tsx (sidebar nav + user avatar + logout)
- components/charts/CategoryPieChart.tsx (donut pie, Recharts)
- components/charts/DailyBarChart.tsx (7-day bar chart, Recharts)
- components/charts/TrendLineChart.tsx (6-month line chart, Recharts)

## ✅ Phase 5: Frontend — Pages + Routing
- hooks/useQueries.ts (all TanStack Query hooks: auth, categories, transactions, budgets, analytics, AI)
- pages/LoginPage.tsx
- pages/RegisterPage.tsx
- pages/DashboardPage.tsx (stats, pie chart, bar chart, AI summary with Generate button)
- pages/TransactionsPage.tsx (list, add/edit/delete modal, month/category/search filters)
- pages/BudgetPage.tsx (budget cards with progress bars, AI suggest button)
- pages/AnalyticsPage.tsx (trend chart, category breakdown, AI prediction)
- pages/SettingsPage.tsx (profile form, currency selector, CSV export, delete account)
- App.tsx (React Router v6, protected routes, Toaster)
- main.tsx (QueryClientProvider + BrowserRouter)
- BUILD: ✅ Frontend `npm run build` passes

## ✅ Phase 6: Integration + Polish (COMPLETED)
- Design polish: All emoji replaced with lucide-react SVG icons
- Card hover shadow added (Card.tsx)
- Modal title accepts ReactNode (for icons in titles)
- Stats cards redesigned with colored icon badges
- Empty states redesigned with centered icon circles
- Edit/delete actions use icon buttons (Pencil, Trash2)
- Search filter has search icon overlay
- Budget progress bars with animated fill + colored status badges
- Login/Register pages: logo replaced with branded icon button
- Settings page: sections with colored icon badges, danger zone styled with warning tint
- Analytics page: stats cards with icon badges, trend chart empty state
- BUILD: ✅ Frontend `npm run build` passes (dist/ created)

## ⏳ Phase 7: Testing + Verification
- [ ] Register new account → auto-redirect to dashboard
- [ ] Add transactions in different categories
- [ ] View dashboard charts render correctly
- [ ] Set budgets → verify progress bars
- [ ] Analytics page shows 6-month trend
- [ ] AI summary generates (needs GROQ_API_KEY)
- [ ] Settings → change currency → verify display updates
- [ ] Export CSV downloads correctly
- [ ] Delete account works

## 🔜 Phase 8: Deploy (pending)
- [ ] Create GitHub repo for pennywise
- [ ] Push code to GitHub
- [ ] Railway: create project + env vars (DATABASE_URL, JWT_SECRET, GROQ_API_KEY, PORT=3000)
- [ ] Vercel: import repo + VITE_API_URL pointing to Railway URL
- [ ] Test production URL

---

## Known Issues / Notes

1. **GROQ_API_KEY**: User needs to sign up at console.groq.com to get free API key. Without it, AI endpoints return error "GROQ_API_KEY not configured". The rest of the app works fine.

2. **Backend runs on**: `http://localhost:3000`
3. **Frontend runs on**: `http://localhost:5173`
4. **Vite proxy**: Frontend proxies `/api/*` to `http://localhost:3000` — so no CORS issues in dev
5. **Chunk size warning**: Frontend bundle is 789KB (recharts + axios + react-query are large). Not a bug, just a build optimization opportunity for later.

## File Structure (complete)

```
pennywise/
├── SPEC.md          ← Full project specification
├── MEMORY.md        ← This file
├── backend/
│   ├── prisma/schema.prisma ✅
│   ├── prisma/dev.db ✅ (SQLite database)
│   ├── src/index.ts ✅
│   ├── src/lib/prisma.ts ✅
│   ├── src/utils/ (jwt.util.ts, bcrypt.util.ts) ✅
│   ├── src/middleware/ (auth.middleware.ts, error.middleware.ts) ✅
│   ├── src/services/ (user, category, transaction, budget, analytics, ai) ✅
│   ├── src/routes/ (auth, category, transaction, budget, analytics, ai, export) ✅
│   ├── .env ✅
│   ├── tsconfig.json ✅
│   └── package.json ✅
└── frontend/
    ├── src/
    │   ├── App.tsx ✅
    │   ├── main.tsx ✅
    │   ├── index.css ✅
    │   ├── lib/ (utils.ts, axios.ts, services.ts) ✅
    │   ├── types/index.ts ✅
    │   ├── stores/auth.store.ts ✅
    │   ├── hooks/useQueries.ts ✅
    │   ├── components/
    │   │   ├── ui/ (Button, Input, Select, Modal, Card, Badge, Spinner) ✅
    │   │   ├── layout/AppLayout.tsx ✅
    │   │   └── charts/ (CategoryPieChart, DailyBarChart, TrendLineChart) ✅
    │   └── pages/ (Login, Register, Dashboard, Transactions, Budget, Analytics, Settings) ✅
    ├── vite.config.ts ✅
    └── package.json ✅
```
