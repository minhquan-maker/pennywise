# PennyWise — Project Workflow

This document describes the full development workflow for PennyWise: from local setup through daily development, testing, and deployment.

---

## 1. Prerequisites

- Node.js 18 or newer
- npm
- Optional: a Groq API key from [console.groq.com](https://console.groq.com). AI features return an error without it; core finance tracking works regardless.

---

## 2. Initial Setup

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set JWT_SECRET, optionally GROQ_API_KEY
npm install
npx prisma generate
npx prisma db push
npm run dev
```

The API runs at `http://localhost:3000`. SQLite database lives at `backend/prisma/dev.db`.

### Frontend

```bash
cd frontend
cp .env.example .env
# .env contains: VITE_API_URL=http://localhost:3000/api
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Vite proxies `/api/*` to the backend during development.

---

## 3. Daily Development Flow

1. **Terminal 1** — `cd backend && npm run dev` (hot-reloads with `tsx watch`)
2. **Terminal 2** — `cd frontend && npm run dev` (Vite HMR for the React app)
3. Edit code; both servers hot-reload.
4. Inspect the database visually: `cd backend && npx prisma studio` (opens a browser UI at port 5555).

---

## 4. Database Management

| Task | Command |
|------|---------|
| View schema | `cat backend/prisma/schema.prisma` |
| Push schema changes | `cd backend && npx prisma db push` |
| Generate client after schema change | `cd backend && npx prisma generate` |
| Visual editor | `cd backend && npx prisma studio` |
| Reset database | Delete `backend/prisma/dev.db`, then `npx prisma db push` |
| Seed defaults | New users get default categories automatically on registration |

---

## 5. Type Checking and Linting

```bash
# Frontend
cd frontend
npx tsc --noEmit    # TypeScript
npm run lint        # ESLint
npm run build       # tsc -b && vite build

# Backend
cd backend
npx tsc --noEmit    # TypeScript
npm run build       # Compile to dist/
```

Run all four before committing.

---

## 6. Git Workflow

- **Branch:** `main` is the stable branch. Feature work uses short-lived branches.
- **Commit messages:** Imperative mood, short summary line, optional body explaining why.
  ```
  fix: clamp analytics months to 1-24
  feat: add scroll reveal to About page
  chore: move SPEC.md to assets/
  ```
- **Pull requests:** Push your branch, open a PR, wait for CI, merge to `main`.
- **Push protection:** Never commit `.env` files. Use `.env.example` as the template.

---

## 7. Frontend Architecture

### Stack
React 19 + TypeScript + Vite + Tailwind CSS v4 + TanStack Query + Zustand + Recharts + Sonner + Lucide React.

### Structure
```
frontend/src/
├── components/      # Layout, UI primitives, modal, charts
│   ├── layout/      # AppLayout with sidebar
│   ├── ui/          # Button, Card, Input, Badge, Modal, etc.
│   └── charts/      # Recharts wrappers
├── hooks/           # Centralized TanStack Query hooks
│   ├── useQueries.ts        # All query/mutation hooks
│   └── useScrollReveal.ts   # IntersectionObserver animation hook
├── lib/             # Axios client, API services, utilities
├── pages/           # Route components
├── stores/          # Zustand stores (auth only)
└── types/           # Shared TypeScript types
```

### Routing
Defined in `App.tsx`. Public routes: `/`, `/login`, `/register`, `/about`. Protected routes (wrapped in `<ProtectedRoute>`): `/dashboard`, `/transactions`, `/budget`, `/analytics`, `/settings`.

### State Management
- **Auth:** Zustand store with localStorage persistence. Read with `useAuthStore(selector)`.
- **Server data:** TanStack Query. All mutations follow:
  ```ts
  const mutation = useMutation({
    mutationFn: service.method,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['key'] }),
    onError: (err) => toast.error(extractError(err)),
  })
  ```

### API Client
`lib/axios.ts` creates an Axios instance with `baseURL: import.meta.env.VITE_API_URL || '/api'`. Interceptors:
- Request: attaches `Authorization: Bearer <token>` from the auth store.
- Response: on 401, clears the store and redirects to `/login`.

---

## 8. Backend Architecture

### Stack
Express + TypeScript + Prisma + SQLite + JWT + bcryptjs + Groq AI.

### Structure
```
backend/src/
├── routes/          # Express routers (one per resource)
├── services/        # Database + AI business logic
├── middleware/      # auth, error handler
├── lib/             # Prisma client singleton
└── utils/           # JWT, bcrypt helpers
```

### Middleware
- `authMiddleware`: reads `Authorization: Bearer <token>`, sets `req.userId`.
- `errorHandler`: logs errors server-side; returns sanitized messages to the client.

### Validation
- Auth: email regex, password >= 8 chars, name required, currency enum.
- Transactions: positive finite amount, valid category ownership, valid date.
- Budgets: positive finite amount, valid month (`YYYY-MM`), valid category ownership.
- Errors return `{ error: string }` with appropriate HTTP status.

---

## 9. API Conventions

- All routes under `/api`.
- Protected routes require `Authorization: Bearer <token>`.
- Errors: `{ error: string }` with status 400/401/404/500.
- Success: data returned directly (no wrapper) or wrapped for collections.

| Resource | Endpoints |
|----------|-----------|
| Auth | `POST /register`, `POST /login`, `GET /me`, `PUT /me`, `DELETE /me` |
| Categories | `GET /`, `POST /`, `PUT /:id`, `DELETE /:id` |
| Transactions | `GET /?month=&category=&search=`, `POST /`, `PUT /:id`, `DELETE /:id`, `DELETE /clear` |
| Budgets | `GET /?month=`, `PUT /`, `DELETE /:id`, `DELETE /clear` |
| Analytics | `GET /dashboard?month=`, `GET /trend?months=` |
| AI | `POST /summary`, `POST /suggest-budget`, `POST /insight`, `POST /predict` |
| Export | `GET /csv?month=` |

---

## 10. Environment Variables

### Backend (`backend/.env`)
| Variable | Purpose | Default |
|----------|---------|---------|
| `DATABASE_URL` | SQLite path | `file:./dev.db` |
| `JWT_SECRET` | JWT signing key | required, throws if missing |
| `GROQ_API_KEY` | Enables AI features | empty (AI returns error) |
| `PORT` | Server port | `3000` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | localhost Vite ports |

### Frontend (`frontend/.env`)
| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_URL` | Backend API base URL | `/api` (uses Vite proxy in dev) |

---

## 11. Testing the App

### Manual smoke test
1. Open `http://localhost:5173`
2. Click "Get Started" → register with email + password (>= 8 chars)
3. Verify default categories are seeded
4. Add a transaction
5. Create a budget
6. Check Dashboard, Analytics, Settings
7. Test CSV export

### Error cases to verify
- Register with short password (< 8) → toast "Password must be at least 8 characters"
- Register with invalid email → toast "Please enter a valid email address"
- Register with duplicate email → toast "Email already in use"
- Login with wrong password → toast "Invalid credentials"

---

## 12. Deployment

See the deployment section in the main `README.md` or the dedicated guide. Summary:

- **Frontend:** Vercel (Vite SPA, root directory `frontend`, build `npm run build`, output `dist`)
- **Backend:** Railway or Render (Node.js, persistent volume for SQLite)
- **Cross-origin:** Set `ALLOWED_ORIGINS` on backend to include the Vercel domain
- **Env:** Frontend `VITE_API_URL` must point to the deployed backend

---

## 13. Common Tasks

### Add a new page
1. Create `frontend/src/pages/MyPage.tsx`
2. Add route in `App.tsx`
3. Add nav link in `AppLayout.tsx` (if protected)
4. Add a service method in `lib/services.ts` if needed
5. Add a query hook in `hooks/useQueries.ts`

### Add a new API endpoint
1. Create/edit a route in `backend/src/routes/`
2. Add business logic in `backend/src/services/`
3. Use `authMiddleware` if protected
4. Return errors via `next(err)` or direct `res.status().json()`

### Modify the database schema
1. Edit `backend/prisma/schema.prisma`
2. Run `cd backend && npx prisma db push`
3. Run `cd backend && npx prisma generate`

---

## 14. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Backend won't start: `JWT_SECRET must be set` | `.env` missing or empty | Copy `.env.example` to `.env`, set a secret |
| CORS errors in browser console | Backend `ALLOWED_ORIGINS` doesn't include frontend URL | Add the Vercel/localhost URL to the comma-separated list |
| AI features return error | Missing `GROQ_API_KEY` | Add your Groq API key to `backend/.env` |
| `prisma` client errors after schema change | Stale generated client | Run `npx prisma generate` |
| Login redirects immediately back to `/login` | 401 interceptor fires (token expired/invalid) | Re-login; check `JWT_SECRET` hasn't changed |