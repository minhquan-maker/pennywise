import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Cpu,
  Menu,
  MessageCircle,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react'
import { Logo, LogoMark } from '@/components/ui/Logo'
import { Orb } from '@/components/ui/Orb'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useDemoLogin } from '@/hooks/useQueries'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { cn } from '@/lib/utils'
import { ContactSection } from '@/components/landing/ContactSection'

/* ─────────────────────────── content ─────────────────────────── */

const NAV = [
  { id: 'features', label: 'Features' },
  { id: 'penny', label: 'Penny AI' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
]

const MARQUEE = ['Cash flow', 'Smart budgets', 'Forecasts', 'Spending pace', 'Health score', 'AI insights', 'CSV export', 'USD & VND', 'Weekday patterns', 'Undo anything']

const LIFECYCLE = [
  {
    tag: 'Track',
    title: 'Log it in two taps, see it everywhere',
    points: ['Expense & income in one sheet', 'Quick amounts and smart dates', 'Grouped by day with running totals', 'Undo any delete'],
    mock: 'track',
  },
  {
    tag: 'Plan',
    title: 'Budgets that know your pace',
    points: ['Suggested limits from 6 months of history', 'Pace marker shows if you are ahead of plan', 'Safe-to-spend per day', 'Copy last month in one click'],
    mock: 'plan',
  },
  {
    tag: 'Predict',
    title: 'Never get surprised by month-end again',
    points: ['Regression + moving-average forecast', 'Likely range, not a single guess', 'Month-end projection while you spend', 'Plain-language explanation'],
    mock: 'predict',
  },
] as const

const TESTIMONIALS = [
  {
    quote: 'The pace line on the budget page changed how I spend. I can see on the 10th that food is running hot — not on the 30th.',
    name: 'Sarah M.',
    role: 'Freelance designer',
  },
  {
    quote: 'Forecast says next month is ~$2.4k and it has been within the range three months running. That is the feature I didn’t know I needed.',
    name: 'James K.',
    role: 'Software engineer',
  },
  {
    quote: 'Clean, fast and the insights are specific. It flagged my weekend spending in the first week.',
    name: 'Priya L.',
    role: 'Graduate researcher',
  },
  {
    quote: 'Tracking in VND finally feels native. Logging lunch takes literally two taps on my phone.',
    name: 'Minh N.',
    role: 'Student',
  },
]

const FAQ = [
  { q: 'Is PennyWise really free?', a: 'Yes. Unlimited transactions, budgets, analytics and CSV export are free. You can delete your account and data at any time.' },
  {
    q: 'Do I need an AI key for the smart features?',
    a: 'No. Forecasts, budget suggestions, insights and the health score are calculated by PennyWise’s own finance engine. When the server has a Groq key configured, an LLM additionally rewrites the explanations in plain language.',
  },
  { q: 'How is the forecast calculated?', a: 'We blend a least-squares trend line with a weighted moving average of your monthly spending (including this month’s projected total) and show an ~80% range from how far your history deviates from the trend.' },
  { q: 'Is there a mobile app?', a: 'PennyWise works on any phone browser today and can be added to your iPhone home screen. A native iOS app is next on the roadmap, built on the same API.' },
  { q: 'Can I export my data?', a: 'Any time, as CSV (Excel-friendly, UTF-8). Per month from Transactions or everything from Settings.' },
]

/* ─────────────────────────── helpers ─────────────────────────── */

function Reveal({ children, className, stagger }: { children: ReactNode; className?: string; stagger?: number }) {
  const ref = useScrollReveal({ stagger })
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

function Pill({ children, tone = 'mist' }: { children: ReactNode; tone?: 'mist' | 'forest' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
        tone === 'mist' ? 'bg-primary-100 text-forest' : 'bg-forest text-primary-500'
      )}
    >
      {children}
    </span>
  )
}

function CheckDot() {
  return (
    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-forest text-primary-500">
      <Check className="h-3 w-3" strokeWidth={3} />
    </span>
  )
}

/* ─────────────────────────── product mockups ─────────────────────────── */

function DashboardMock() {
  const bars = [38, 52, 44, 60, 55, 72, 66, 80, 74, 92]
  return (
    <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-line bg-surface text-left shadow-[var(--shadow-float)]">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="ml-3 rounded-full bg-surface-3 px-3 py-1 text-[10px] text-text-tertiary">pennywise.app/dashboard</span>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
        <div className="rounded-2xl bg-forest p-4 sm:col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-500">Net cash flow · October</p>
          <p className="display num mt-2 text-4xl text-primary-500 sm:text-5xl">+$1,847</p>
          <div className="mt-3 flex gap-2 text-[10px]">
            <span className="rounded-full bg-white/10 px-2 py-0.5 font-semibold text-white">In $3,200</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 font-semibold text-white">Out $1,353</span>
          </div>
          <div className="mt-4 flex h-20 items-end gap-1.5">
            {bars.map((h, i) => (
              <div key={i} className={cn('flex-1 rounded-t-[4px]', i === bars.length - 1 ? 'bg-primary-500' : 'bg-white/15')} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-3 p-4">
          <div className="relative h-24 w-24">
            <svg viewBox="0 0 100 100" className="-rotate-90">
              <circle cx="50" cy="50" r="42" stroke="var(--color-surface)" strokeWidth="10" fill="none" />
              <circle cx="50" cy="50" r="42" stroke="var(--color-positive)" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="58" />
            </svg>
            <span className="display absolute inset-0 flex items-center justify-center text-3xl text-text-primary">78</span>
          </div>
          <p className="mt-2 rounded-full bg-primary-500 px-2.5 py-0.5 text-[11px] font-semibold text-forest">Good health</p>
        </div>
        {[
          { n: 'Food', p: 64, c: '#d95926' },
          { n: 'Transport', p: 38, c: '#3987e5' },
          { n: 'Fun', p: 92, c: '#c98500' },
        ].map((b) => (
          <div key={b.n} className="rounded-2xl bg-surface-3 p-3.5">
            <div className="flex justify-between text-[11px]">
              <span className="font-semibold text-text-secondary">{b.n}</span>
              <span className="text-text-tertiary">{b.p}%</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-surface">
              <div className="h-full rounded-full" style={{ width: `${b.p}%`, background: b.c }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LifecycleMock({ kind }: { kind: (typeof LIFECYCLE)[number]['mock'] }) {
  if (kind === 'track')
    return (
      <div className="space-y-2">
        {[
          ['utensils', '#d95926', 'Lunch with team', '−$18.40'],
          ['briefcase', '#7cc84a', 'October salary', '+$3,200'],
          ['bus', '#3987e5', 'Metro top-up', '−$25.00'],
          ['coffee', '#c98500', 'Coffee', '−$4.20'],
        ].map(([i, c, n, a]) => (
          <div key={n} className="flex items-center gap-3 rounded-xl bg-surface-3 px-3 py-2.5">
            <CategoryIcon icon={i} color={c} size="sm" />
            <span className="flex-1 text-xs font-medium text-text-primary">{n}</span>
            <span className={cn('num text-xs font-bold', a.startsWith('+') ? 'text-positive' : 'text-text-primary')}>{a}</span>
          </div>
        ))}
      </div>
    )
  if (kind === 'plan')
    return (
      <div className="space-y-3 rounded-2xl bg-surface-3 p-4">
        {[
          ['Food', 72, 55, '#d95926'],
          ['Shopping', 105, 55, '#d55181'],
          ['Transport', 30, 55, '#3987e5'],
        ].map(([n, p, pace, c]) => (
          <div key={n as string}>
            <div className="mb-1.5 flex justify-between text-[11px]">
              <span className="font-semibold text-text-secondary">{n}</span>
              <span className={(p as number) > 100 ? 'font-semibold text-danger-500' : 'text-text-tertiary'}>{p}%</span>
            </div>
            <div className="relative h-2 rounded-full bg-surface">
              <div className="h-full rounded-full" style={{ width: `${Math.min(p as number, 100)}%`, background: (p as number) > 100 ? 'var(--color-danger-500)' : (c as string) }} />
              <span className="absolute -top-1 h-4 w-[3px] -translate-x-1/2 rounded bg-text-primary ring-2 ring-surface-3" style={{ left: `${pace}%` }} />
            </div>
          </div>
        ))}
        <p className="pt-1 text-[11px] font-semibold text-positive">Safe to spend: $28.70 / day</p>
      </div>
    )
  return (
    <div className="rounded-2xl bg-surface-3 p-4">
      <svg viewBox="0 0 240 110" className="w-full">
        <path d="M170 60 L220 48 L220 30 L170 60 L220 66 Z" fill="var(--color-primary-500)" opacity="0.7" />
        <path d="M10 85 L50 78 L90 74 L130 66 L170 60" stroke="var(--color-forest)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M170 60 L220 48" stroke="var(--color-forest)" strokeWidth="2.5" strokeDasharray="5 5" />
        {[10, 50, 90, 130, 170].map((x, i) => (
          <circle key={x} cx={x} cy={[85, 78, 74, 66, 60][i]} r="3.5" fill="var(--color-forest)" />
        ))}
        <circle cx="220" cy="48" r="5" fill="var(--color-surface)" stroke="var(--color-forest)" strokeWidth="2.5" />
      </svg>
      <p className="display num mt-1 text-3xl text-text-primary">$2,775</p>
      <p className="text-[11px] text-text-tertiary">November forecast · likely $2,377 – $3,173</p>
    </div>
  )
}

/* ─────────────────────────── page ─────────────────────────── */

export function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const demo = useDemoLogin()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [slide, setSlide] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // /about deep-links to the features section
  useEffect(() => {
    if (location.pathname === '/about') document.getElementById('features')?.scrollIntoView()
  }, [location.pathname])

  const go = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }
  const startDemo = () => demo.mutate(undefined, { onSuccess: () => navigate('/dashboard') })

  const perView = 3
  const maxSlide = Math.max(0, TESTIMONIALS.length - perView)

  return (
    <div className="min-h-dvh bg-bg text-text-primary">
      {/* ─── Nav ─── */}
      <header className={cn('fixed inset-x-0 top-0 z-50 border-b bg-bg/95 backdrop-blur-xl transition-colors', scrolled || menuOpen ? 'border-line' : 'border-transparent')}>
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Logo />
          <div className="hidden items-center rounded-full bg-surface-3 p-1 md:flex">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => go(n.id)} className="rounded-full px-4 py-1.5 text-sm font-semibold text-forest transition-colors hover:bg-surface">
                {n.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-forest transition-colors hover:bg-surface-3 sm:block">
              Sign in
            </Link>
            <Link to="/register" className="hidden sm:block">
              <Button size="sm">Get started</Button>
            </Link>
            <button onClick={() => setMenuOpen((o) => !o)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-3 text-forest md:hidden" aria-label="Menu">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div className="animate-scale-in mx-auto max-w-6xl border-t border-line px-5 pb-5 pt-2 md:hidden">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => go(n.id)} className="block w-full rounded-full px-4 py-3 text-left text-[15px] font-semibold text-forest hover:bg-surface-3">
                {n.label}
              </button>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button className="w-full">Get started</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero ─── */}
      <section className="relative px-5 pb-20 pt-32 sm:pt-40">
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="animate-fade-up">
            <Pill>
              <Sparkles className="h-3.5 w-3.5" /> AI-powered personal finance · free
            </Pill>
          </div>
          <h1 className="display animate-fade-up mx-auto mt-6 max-w-5xl text-[44px] text-text-primary [animation-delay:80ms] sm:text-[76px] lg:text-[104px]">
            Managing money in the age of AI
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-secondary [animation-delay:160ms]">
            Track spending and income, set budgets that know your pace, and see next month before it happens — with an assistant that explains every number.
          </p>
          <div className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-4 [animation-delay:240ms] sm:flex-row sm:gap-6">
            <Link to="/register">
              <Button size="lg" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">
                Get started free
              </Button>
            </Link>
            <button
              onClick={startDemo}
              disabled={demo.isPending}
              className="inline-flex items-center gap-2 text-[15px] font-semibold text-forest underline decoration-2 underline-offset-[6px] transition-opacity disabled:opacity-60"
            >
              {demo.isPending && <Spinner size="sm" color="current" />}
              Try the live demo
            </button>
          </div>
          <p className="animate-fade-up mt-5 text-xs text-text-tertiary [animation-delay:300ms]">No card needed · demo is pre-filled with 6 months of data</p>

          <div className="animate-fade-up relative mx-auto mt-16 max-w-4xl [animation-delay:380ms]">
            <Orb className="animate-float absolute -right-4 -top-12 z-10 w-24 sm:-right-12 sm:-top-16 sm:w-36" />
            <DashboardMock />
          </div>
        </div>
      </section>

      {/* ─── Marquee (mist band) ─── */}
      <div className="mask-fade-x overflow-hidden bg-primary-100 py-5">
        <div className="animate-marquee flex w-max gap-10">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="display flex items-center gap-10 whitespace-nowrap text-2xl text-forest">
              {m} <LogoMark className="h-6 w-6" />
            </span>
          ))}
        </div>
      </div>

      {/* ─── Meet Penny (forest) ─── */}
      <section id="penny" className="scroll-mt-16 bg-forest px-5 py-24 text-white sm:py-28">
        <Reveal className="mx-auto max-w-6xl text-center">
          <Orb className="animate-float mx-auto w-36 sm:w-48" />
          <h2 className="display mt-10 text-[44px] text-primary-500 sm:text-[80px]">
            Meet Penny,
            <br />
            your money’s ally
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/75">
            A finance engine that reads every transaction, plus an optional AI layer that explains it — summaries, budget suggestions and forecasts in plain words.
          </p>
        </Reveal>

        <Reveal className="mx-auto mt-16 grid max-w-5xl gap-4 md:grid-cols-2" stagger={120}>
          <div className="rounded-[var(--radius-3xl)] bg-surface p-6 text-text-primary">
            <p className="eyebrow mb-4">Penny noticed</p>
            {[
              { t: 'Shopping is over budget', b: '$214 of $200 — pause non-essentials for the rest of the month.', c: 'text-warning-500 bg-warning-500/10' },
              { t: 'Saving 58% of income', b: 'You kept $1,847 this month — well above the 20% rule of thumb.', c: 'text-positive bg-primary-100' },
              { t: 'Weekends cost you most', b: '47% of spending lands on Sat–Sun. Plan weekend activities ahead.', c: 'text-info-500 bg-info-500/10' },
            ].map((i) => (
              <div key={i.t} className="mb-2 flex gap-3 rounded-2xl bg-surface-2 p-3 last:mb-0">
                <span className={cn('mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full', i.c)}>
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{i.t}</p>
                  <p className="text-xs leading-relaxed text-text-secondary">{i.b}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-between rounded-[var(--radius-3xl)] border border-white/15 p-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <LogoMark className="h-6 w-6" />
                <span className="font-semibold">penny</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/80">
                  <Cpu className="h-3 w-3" />
                  works without an API key
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-bold tracking-[-0.02em]">Smart features, available now.</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Forecasts, budget suggestions, insights and a 0–100 health score are computed by audited algorithms. Plug in Groq and Penny rewrites them in natural language.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-5">
              <Button onClick={startDemo} isLoading={demo.isPending}>
                Try Penny
              </Button>
              <button onClick={() => go('faq')} className="text-sm font-semibold text-white underline decoration-2 underline-offset-[6px]">
                How it works
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-6 border-t border-white/15 pt-10 md:grid-cols-4" stagger={90}>
          {[
            ['2 taps', 'to log a transaction'],
            ['6 mo', 'of history drive suggestions'],
            ['80%', 'confidence range on forecasts'],
            ['$0', 'free forever — USD or VND'],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="display text-4xl text-primary-500 sm:text-5xl">{n}</p>
              <p className="mt-2 text-sm text-white/65">{l}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ─── Lifecycle features ─── */}
      <section id="features" className="scroll-mt-16 px-5 py-24 sm:py-28">
        <Reveal className="mx-auto max-w-6xl text-center">
          <h2 className="display text-[40px] text-text-primary sm:text-[72px]">
            The entire life cycle
            <br /> of your money, <span className="mark">assisted</span>
          </h2>
        </Reveal>
        <div className="mx-auto mt-14 max-w-5xl space-y-5">
          {LIFECYCLE.map((f, i) => (
            <Reveal key={f.tag}>
              <div className="grid items-center gap-8 overflow-hidden rounded-[var(--radius-3xl)] bg-surface-3 p-6 sm:p-10 md:grid-cols-2">
                <div className={cn(i % 2 === 1 && 'md:order-2')}>
                  <Pill tone="forest">{f.tag}</Pill>
                  <h3 className="mt-5 text-3xl font-bold leading-tight tracking-[-0.025em] text-text-primary">{f.title}</h3>
                  <ul className="mt-6 space-y-3">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-start gap-3 text-[15px] text-text-secondary">
                        <CheckDot />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="mt-8 inline-block">
                    <Button size="sm" variant="dark">
                      Try it free
                    </Button>
                  </Link>
                </div>
                <div className="rounded-[var(--radius-2xl)] bg-surface p-4 sm:p-6">
                  <LifecycleMock kind={f.mock} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Reviews (mist band) ─── */}
      <section id="reviews" className="scroll-mt-16 bg-primary-100 px-5 py-24 text-forest">
        <Reveal className="mx-auto flex max-w-6xl flex-col items-center gap-2 text-center" stagger={100}>
          <div className="flex items-center gap-3">
            <span className="display rounded-full bg-surface px-5 pb-1 pt-2 text-[28px] sm:px-6 sm:text-6xl">Our users</span>
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-forest text-primary-500 sm:h-16 sm:w-16">
              <MessageCircle className="h-5 w-5 sm:h-8 sm:w-8" />
            </span>
          </div>
          <span className="display rounded-full bg-primary-500 px-5 pb-1 pt-2 text-[28px] sm:px-6 sm:text-6xl">Talk about it</span>
          <div className="flex items-center gap-3">
            <span className="display rounded-full bg-surface px-5 pb-1 pt-2 text-[28px] sm:px-6 sm:text-6xl">Better than us</span>
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-forest text-primary-500 sm:h-16 sm:w-16">
              <ArrowDown className="h-5 w-5 sm:h-8 sm:w-8" />
            </span>
          </div>
        </Reveal>

        <div className="mx-auto mt-14 max-w-6xl overflow-hidden">
          <div className="flex transition-transform duration-500 ease-out max-md:flex-col max-md:gap-4 md:[transform:translateX(calc(var(--slide)*-33.333%))]" style={{ ['--slide' as string]: slide }}>
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="flex-shrink-0 md:w-1/3 md:px-2">
                <div className="flex h-full flex-col justify-between rounded-[var(--radius-2xl)] bg-surface p-6">
                  <blockquote className="text-[15px] leading-relaxed text-text-secondary">“{t.quote}”</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest font-bold text-primary-500">{t.name.charAt(0)}</span>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                      <p className="text-xs text-text-tertiary">{t.role}</p>
                    </div>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
          <div className="mt-8 hidden justify-center gap-3 md:flex">
            <button onClick={() => setSlide((s) => Math.max(0, s - 1))} disabled={slide === 0} aria-label="Previous" className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-white transition-opacity disabled:opacity-30">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setSlide((s) => Math.min(maxSlide, s + 1))} disabled={slide >= maxSlide} aria-label="Next" className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-white transition-opacity disabled:opacity-30">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── Every device (forest card) ─── */}
      <section className="px-5 py-24">
        <Reveal className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-[var(--radius-3xl)] bg-forest p-8 text-white sm:p-14">
            <svg className="pointer-events-none absolute -right-10 top-0 h-full opacity-40" viewBox="0 0 300 300" fill="none" aria-hidden>
              <circle cx="200" cy="150" r="120" stroke="var(--color-primary-500)" strokeWidth="2" />
              <circle cx="200" cy="150" r="80" stroke="var(--color-primary-500)" strokeWidth="2" />
              <circle cx="320" cy="150" r="10" fill="var(--color-primary-500)" />
              <circle cx="200" cy="30" r="10" fill="var(--color-primary-500)" />
              <circle cx="120" cy="150" r="10" fill="var(--color-primary-500)" />
            </svg>
            <div className="relative max-w-xl">
              <h2 className="display text-[40px] text-primary-500 sm:text-6xl">Built for the web today, iPhone next</h2>
              <p className="mt-5 text-lg text-white/75">Install PennyWise to your home screen now — the native iOS app runs on the same API and lands next.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Responsive web app', 'Add to Home Screen', 'Bottom-tab mobile UI', 'iOS app — coming next'].map((c) => (
                  <span key={c} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
                    <Smartphone className="h-3.5 w-3.5" /> {c}
                  </span>
                ))}
              </div>
              <Link to="/register" className="mt-8 inline-block">
                <Button>Start on the web</Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="scroll-mt-16 px-5 pb-24">
        <Reveal className="mx-auto max-w-3xl rounded-[var(--radius-3xl)] bg-surface-3 p-6 sm:p-12">
          <h2 className="display text-center text-[44px] text-text-primary sm:text-6xl">Any questions?</h2>
          <div className="mt-10 divide-y divide-line-strong">
            {FAQ.map((f, i) => (
              <div key={f.q}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left text-[17px] font-semibold text-forest" aria-expanded={openFaq === i}>
                  {f.q}
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface">
                    <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', openFaq === i && 'rotate-180')} />
                  </span>
                </button>
                <div className={cn('grid transition-all duration-300 ease-out', openFaq === i ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                  <p className="overflow-hidden text-[15px] leading-relaxed text-text-secondary">{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ─── Contact ─── */}
      <ContactSection />

      {/* ─── Final CTA ─── */}
      <section className="px-5 pb-28 text-center">
        <Reveal>
          <h2 className="display mx-auto max-w-4xl text-[44px] text-text-primary sm:text-[80px]">
            Speed up your savings <span className="mark">with AI</span>
          </h2>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link to="/register">
              <Button variant="dark" size="lg">
                Create free account
              </Button>
            </Link>
            <button onClick={startDemo} className="text-[15px] font-semibold text-forest underline decoration-2 underline-offset-[6px]">
              or explore the demo →
            </button>
          </div>
        </Reveal>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-forest px-5 pb-10 pt-16 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 rounded-full border border-white/15 p-2 pl-6 sm:flex-row sm:items-center sm:justify-between max-sm:rounded-[var(--radius-2xl)] max-sm:p-5">
            <p className="text-sm text-white/75">
              <span className="font-semibold text-white">New:</span> forecasts with confidence ranges and budget pace tracking.
            </p>
            <Button size="sm" onClick={startDemo} isLoading={demo.isPending}>
              See it live
            </Button>
          </div>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Logo tone="light" />
              <p className="mt-4 max-w-xs text-sm text-white/60">AI-powered personal finance — track, plan and predict.</p>
            </div>
            {[
              { h: 'Product', l: [['Features', 'features'], ['Penny AI', 'penny'], ['FAQ', 'faq'], ['Contact', 'contact']] },
              { h: 'Account', l: [['Sign in', '/login'], ['Create account', '/register']] },
              { h: 'Project', l: [['GitHub', 'https://github.com/minhquan-maker/pennywise'], ['Author', 'https://minhquannguyen.vercel.app']] },
            ].map((col) => (
              <div key={col.h}>
                <p className="eyebrow mb-4 text-primary-500">{col.h}</p>
                <ul className="space-y-2.5">
                  {col.l.map(([label, href]) => (
                    <li key={label}>
                      {href.startsWith('http') ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 transition-colors hover:text-white">
                          {label}
                        </a>
                      ) : href.startsWith('/') ? (
                        <Link to={href} className="text-sm text-white/70 transition-colors hover:text-white">
                          {label}
                        </Link>
                      ) : (
                        <button onClick={() => go(href)} className="text-sm text-white/70 transition-colors hover:text-white">
                          {label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-14 flex flex-col justify-between gap-3 border-t border-white/15 pt-6 text-xs text-white/50 sm:flex-row">
            <p>© {new Date().getFullYear()} PennyWise · Built by Nguyen Minh Quan</p>
            <p>Your data is never sold or shared.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
