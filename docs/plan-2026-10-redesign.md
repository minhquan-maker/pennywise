# PennyWise — Redesign & Feature Completion Plan (Oct 2026)

Goal: finish the web app (features, design, calculations) first, then reuse the same API for an iOS client.
Visual reference: Tomorro (tomorro.com) — deep forest-black surfaces, neon green accent, heavy condensed
uppercase display type, pill buttons, glowing ring "orb", big rounded cards, cream contrast sections.

## 1. Audit — what was missing or broken

### Design
- Mixed light/dark tokens: `.card`, `.btn-secondary`, `.skeleton`, Recharts tooltip and the Sonner toaster still used
  white "Wix" surfaces on a dark app (white skeletons, light toasts, light secondary buttons).
- Hard-coded hex colours everywhere (`#171717`, `#262626`, `#0A0A0A`) instead of theme tokens.
- No display typography, no visual identity beyond a lime "P" square; landing/about pages duplicated each other.
- Trend chart drew an `<Area>` inside a `<LineChart>` (never rendered).
- Row actions only visible on hover → unusable on touch devices. No mobile navigation besides a hamburger.
- Three different FAB implementations, `confirm()` dialogs, no undo.

### Features
- Expense-only: no income, so no net balance, savings rate or cash-flow view.
- AI insight endpoint existed but was never used in the UI.
- Every "smart" feature hard-failed without `GROQ_API_KEY`.
- Category editing existed in hooks but had no UI; no password change.
- Budgets: no edit-in-place, no copy-from-last-month, no overview, no pace/projection.
- Transactions: no grouping, no totals, search only matched notes, no type filter, no debounce.
- No demo data → analytics look empty for visitors.

### Calculations / logic bugs
- Budget progress matched spending by category **name** (breaks on renamed/duplicate names).
- "Clear all" dialogs said "for <month>" but the API wiped **everything**.
- Prediction formula `recent * (1 + change%)` double-counted the trend.
- `last7Days` was anchored to today even when viewing another month and ignored days from the previous month.
- Server used local-time month boundaries while the client stored UTC midnight → off-by-one-day across time zones.
- AI budget suggestion called `mutate` in a loop and only looked at one month of history.
- CSV export did not escape category names or include type.

## 2. Plan

### Backend
1. Schema: `type` (`expense` | `income`) on `Transaction` and `Category`; income default categories.
2. UTC date helpers used by every month/day calculation.
3. `finance.engine.ts` — pure, unit-tested algorithms:
   - Least-squares linear regression + weighted moving average blend for next-month forecast with a
     confidence band from residual standard deviation.
   - Month-end projection: run-rate blended with history, weighted by month progress.
   - Budget suggestions: weighted median/WMA of 3–6 months per category, rounded to "nice" numbers.
   - Rule-based insights (concentration, biggest increase, weekend share, budget overruns, savings rate).
   - Financial health score (0–100) from savings rate, budget adherence and trend.
   - Safe-to-spend per day.
4. Richer `/analytics/dashboard`, `/analytics/trend` (income + expense), `/analytics/insights`, `/analytics/forecast`.
5. AI routes use Groq when configured and **fall back to the engine** otherwise (`source: "ai" | "engine"`).
6. Budgets: bulk apply, copy from previous month, month-scoped clear. Transactions: type filter, category-name
   search, limit, month-scoped clear. Auth: password change, demo account with generated history, login throttling.
7. `node:test` unit tests for the engine.

### Frontend
1. New token-based theme (forest/neon), Anton display + Inter, grain + glow utilities, reveal-on-scroll.
2. Rebuilt UI kit: pill buttons, cards, bottom-sheet modal on mobile, confirm dialog, segmented control,
   month stepper, glow orb, progress ring, empty states.
3. App shell: sidebar on desktop, iOS-style bottom tab bar with central add button on mobile.
4. Pages: Dashboard (health orb, cash flow, pace chart, recent, budgets, insights), Transactions (grouped, totals,
   undo delete), Budget (overview, pace marker, projection, AI review-and-apply, copy), Analytics (range,
   income vs expense, forecast band, weekday pattern, MoM deltas), Settings (category edit, password).
5. Landing page rebuilt after the reference; auth pages restyled; About merged into the new visual language.
6. PWA manifest + Apple meta tags (installable on iPhone now; groundwork for the native app).

### Deploy
- Frontend: Vercel (`frontend/`, SPA rewrite already in place). Set `VITE_API_URL`.
- Backend: Node host with a persistent disk for SQLite (Railway/Render/Fly). `npm run build && npm run start:prod`.

## 3. iOS phase (next)
- Same REST API. Recommended path: Expo (React Native) app sharing `types` + engine-derived API responses,
  or a Capacitor wrapper around this web build for a fast first TestFlight.
- Needed before iOS: refresh tokens, push notifications for budget alerts, recurring transactions, CSV import.
