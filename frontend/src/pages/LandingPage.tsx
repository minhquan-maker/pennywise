import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import {
  ArrowRight,
  Wallet,
  BarChart3,
  Shield,
  Zap,
  Settings,
  TrendingUp,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'

const features = [
  {
    icon: Wallet,
    title: 'Track Every Expense',
    description:
      'Log daily transactions in seconds with smart categorization. Complete financial clarity without the spreadsheet headache.',
  },
  {
    icon: TrendingUp,
    title: 'Smart Budget Controls',
    description:
      'Set monthly spending limits per category and receive proactive alerts before you exceed them.',
  },
  {
    icon: Zap,
    title: 'AI-Powered Insights',
    description:
      'Personalized spending analysis and intelligent budget suggestions powered by AI — tailored to your habits.',
  },
  {
    icon: BarChart3,
    title: 'Visual Analytics',
    description:
      'Beautiful charts surface your spending patterns, trends, and category distributions at a glance.',
  },
  {
    icon: Settings,
    title: 'Export Your Data',
    description:
      'Download your complete financial history as CSV anytime. Your data remains yours — fully portable.',
  },
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description:
      'JWT authentication, encrypted connections, and zero third-party data sharing. Your data stays private.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Create your account',
    description: 'Sign up in under 30 seconds. No credit card required — start tracking immediately.',
  },
  {
    number: '02',
    title: 'Log your transactions',
    description: 'Add expenses daily using our quick-add interface with intelligent auto-categorization.',
  },
  {
    number: '03',
    title: 'Receive AI insights',
    description: 'Get monthly summaries, budget recommendations, and spending predictions powered by AI.',
  },
]

const testimonials = [
  {
    quote:
      'PennyWise helped me save $200 per month without changing my lifestyle. The budget alerts alone were a game changer.',
    name: 'Sarah Mitchell',
    title: 'Freelance Designer',
  },
  {
    quote:
      'The AI insights are genuinely useful. It flagged my recurring subscription overspending within the first week.',
    name: 'James Kowalski',
    title: 'Software Engineer',
  },
  {
    quote:
      'Clean, fast, and the analytics are actually readable. I finally understand where my money goes every month.',
    name: 'Priya Lal',
    title: 'Graduate Researcher',
  },
]

/* ─── Abstract ascending chart visualization (CSS/SVG) ─── */
function DashboardVisualization() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Outer card */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: '#171717', borderColor: '#262626' }}
      >
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: '#262626' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#262626' }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#262626' }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#262626' }} />
          </div>
          <div className="h-1.5 w-20 rounded-full" style={{ backgroundColor: '#262626' }} />
        </div>

        {/* Chart area */}
        <div className="p-5 space-y-6">
          {/* Bar chart - ascending pattern */}
          <div className="space-y-3">
            <div className="h-1.5 w-24 rounded-full" style={{ backgroundColor: '#262626' }} />
            <div className="flex items-end gap-2 h-32">
              {[
                { h: 28, active: false },
                { h: 40, active: false },
                { h: 35, active: false },
                { h: 55, active: false },
                { h: 48, active: false },
                { h: 65, active: false },
                { h: 58, active: false },
                { h: 75, active: false },
                { h: 68, active: false },
                { h: 85, active: true },
              ].map((bar, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${bar.h}%`,
                    backgroundColor: bar.active ? '#BFFF00' : '#262626',
                  }}
                />
              ))}
            </div>
            {/* Trend line */}
            <svg
              viewBox="0 0 280 40"
              className="w-full h-6"
              style={{ overflow: 'visible' }}
              fill="none"
            >
              <path
                d="M0 35 L28 28 L56 30 L84 18 L112 22 L140 12 L168 16 L196 8 L224 12 L252 2 L280 2"
                stroke="#BFFF00"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
              />
              <circle cx="280" cy="2" r="3" fill="#BFFF00" />
            </svg>
          </div>

          {/* Metric row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Spent', value: '$1,247', accent: true },
              { label: 'Budget', value: '$1,600', accent: false },
              { label: 'Saved', value: '$353', accent: true },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: '#0A0A0A' }}
              >
                <div
                  className="text-lg font-extrabold tracking-tight"
                  style={{ color: m.accent ? '#BFFF00' : '#ffffff' }}
                >
                  {m.value}
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#A3A3A3' }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>

          {/* Category bars */}
          <div className="space-y-3">
            <div className="h-1.5 w-20 rounded-full" style={{ backgroundColor: '#262626' }} />
            {[
              { label: 'Food', pct: 78 },
              { label: 'Transport', pct: 45 },
              { label: 'Entertainment', pct: 28 },
            ].map((cat) => (
              <div key={cat.label} className="flex items-center gap-3">
                <div className="w-16 text-xs" style={{ color: '#A3A3A3' }}>
                  {cat.label}
                </div>
                <div
                  className="flex-1 h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: '#262626' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${cat.pct}%`, backgroundColor: '#BFFF00' }}
                  />
                </div>
                <div className="text-xs font-medium" style={{ color: '#A3A3A3' }}>
                  {cat.pct}%
                </div>
              </div>
            ))}
          </div>

          {/* Transaction rows */}
          <div className="space-y-2 pt-1">
            <div className="h-1.5 w-24 rounded-full" style={{ backgroundColor: '#262626' }} />
            {[
              { name: 'Gourmet Bistro', amount: '-$42.50', accent: true },
              { name: 'Metro Monthly', amount: '-$35.00', accent: false },
              { name: 'Streaming Sub', amount: '-$14.99', accent: false },
            ].map((tx) => (
              <div
                key={tx.name}
                className="flex items-center justify-between py-2 border-b"
                style={{ borderColor: '#262626' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: '#0A0A0A' }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: tx.accent ? '#BFFF00' : '#A3A3A3' }}
                    />
                  </div>
                  <span className="text-xs text-white">{tx.name}</span>
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: tx.accent ? '#BFFF00' : '#A3A3A3' }}
                >
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating accent badge */}
      <div
        className="absolute -bottom-4 -right-4 rounded-xl border px-4 py-3 hidden md:flex items-center gap-3"
        style={{
          backgroundColor: '#171717',
          borderColor: '#262626',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#BFFF00' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 10L5 7L7 9L12 4"
              stroke="#0A0A0A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="space-y-0.5">
          <div className="h-1.5 w-14 rounded-full" style={{ backgroundColor: '#262626' }} />
          <div className="h-1 w-8 rounded-full" style={{ backgroundColor: '#BFFF00', opacity: 0.3 }} />
        </div>
      </div>

      {/* Decorative dots */}
      <div
        className="absolute -top-3 -left-3 w-6 h-6 rounded-full opacity-20"
        style={{ backgroundColor: '#BFFF00' }}
      />
      <div
        className="absolute top-10 -left-6 w-2 h-2 rounded-full opacity-10"
        style={{ backgroundColor: '#BFFF00' }}
      />
      <div
        className="absolute bottom-10 -right-6 w-3 h-3 rounded-full opacity-15"
        style={{ backgroundColor: '#BFFF00' }}
      />
    </div>
  )
}

export function LandingPage() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true })
  }, [token, navigate])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50">
        {/* Lime green band behind navbar */}
        <div className="h-1 w-full" style={{ backgroundColor: '#BFFF00' }} />
        {/* Dark pill bar */}
        <div className="border-t border-b" style={{ backgroundColor: '#090909', borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#BFFF00' }}
              >
                <span className="text-black font-bold text-xs">P</span>
              </div>
              <span className="font-semibold text-white text-sm">PennyWise</span>
            </Link>
            {/* Nav links */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => scrollToSection('features')}
                className="text-white/70 hover:text-white text-xs transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-white/70 hover:text-white text-xs transition-colors"
              >
                How It Works
              </button>
              <Link to="/about" className="text-white/70 hover:text-white text-xs transition-colors">
                Pricing
              </Link>
            </div>
            {/* CTA */}
            <Link to="/register">
              <button
                className="rounded-full text-xs font-bold px-5 py-2 transition-opacity hover:opacity-85"
                style={{ backgroundColor: '#BFFF00', color: '#0A0A0A' }}
              >
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="pt-20 pb-32 px-6" style={{ backgroundColor: '#0A0A0A' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: text */}
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-widest"
                style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#A3A3A3' }}>
                AI-Powered Personal Finance
              </div>
              <h1 className="text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
                Take Control of<br />
                <span style={{ color: '#BFFF00' }}>Your Finances</span>
              </h1>
              <p className="text-lg max-w-lg leading-relaxed" style={{ color: '#A3A3A3' }}>
                AI-powered personal finance tracker. Track expenses, set budgets, get insights — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/register">
                  <button
                    className="rounded-full text-sm font-bold px-8 py-4 transition-opacity hover:opacity-85 flex items-center gap-2"
                    style={{ backgroundColor: '#BFFF00', color: '#0A0A0A' }}
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <button
                  onClick={() => scrollToSection('features')}
                  className="rounded-full text-sm font-medium px-8 py-4 border transition-colors hover:border-white/30"
                  style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#A3A3A3' }}
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Right: geometric visualization */}
            <div className="flex-1 w-full">
              <DashboardVisualization />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="py-8 px-6" style={{ backgroundColor: '#BFFF00' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center">
            <div className="text-3xl font-extrabold text-black">10,000+</div>
            <div className="text-xs font-medium text-black/60 mt-0.5">Active Users</div>
          </div>
          <div className="hidden md:block w-px h-10" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} />
          <div className="text-center">
            <div className="text-3xl font-extrabold text-black">50M+</div>
            <div className="text-xs font-medium text-black/60 mt-0.5">Transactions Tracked</div>
          </div>
          <div className="hidden md:block w-px h-10" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} />
          <div className="text-center">
            <div className="text-3xl font-extrabold text-black">4.9/5</div>
            <div className="text-xs font-medium text-black/60 mt-0.5">User Rating</div>
          </div>
          <div className="hidden md:block w-px h-10" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} />
          <div className="text-center">
            <div className="text-3xl font-extrabold text-black">$2.4M</div>
            <div className="text-xs font-medium text-black/60 mt-0.5">Saved by Users</div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 px-6" style={{ backgroundColor: '#0A0A0A' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 space-y-4">
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#BFFF00' }}>
              Core Features
            </div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">
              Everything you need
            </h2>
            <p className="text-base max-w-lg leading-relaxed" style={{ color: '#A3A3A3' }}>
              Purpose-built tools for individuals who want real control over their finances.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border"
                style={{ backgroundColor: '#171717', borderColor: '#262626' }}
              >
                <div className="w-1 h-8 rounded-full mb-4" style={{ backgroundColor: '#BFFF00' }} />
                <div className="flex items-center gap-3 mb-3">
                  <f.icon className="w-4 h-4" style={{ color: '#A3A3A3' }} />
                  <h3 className="text-sm font-bold text-white">{f.title}</h3>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#A3A3A3' }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-24 px-6" style={{ backgroundColor: '#0A0A0A' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center space-y-4">
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#BFFF00' }}>
              Process
            </div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">
              Get started in minutes
            </h2>
            <p className="text-base max-w-md mx-auto" style={{ color: '#A3A3A3' }}>
              Three simple steps to complete financial clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div
                    className="hidden md:block absolute top-8 left-full w-full h-px z-0"
                    style={{ backgroundColor: '#262626' }}
                  />
                )}
                <div className="relative z-10">
                  <div
                    className="text-6xl font-extrabold tracking-tight leading-none mb-4"
                    style={{ color: '#BFFF00' }}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#A3A3A3' }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to="/register">
              <button
                className="rounded-full text-sm font-bold px-8 py-4 transition-opacity hover:opacity-85 flex items-center gap-2 mx-auto"
                style={{ backgroundColor: '#BFFF00', color: '#0A0A0A' }}
              >
                Start Tracking Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 px-6" style={{ backgroundColor: '#0A0A0A' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center space-y-4">
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#BFFF00' }}>
              Testimonials
            </div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">
              Trusted by users worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <blockquote
                key={t.name}
                className="p-6 rounded-2xl border space-y-4"
                style={{ backgroundColor: '#171717', borderColor: '#262626' }}
              >
                <div className="text-4xl font-serif leading-none" style={{ color: '#262626' }}>
                  "
                </div>
                <p className="text-sm leading-relaxed -mt-3" style={{ color: '#A3A3A3' }}>
                  {t.quote}
                </p>
                <footer className="pt-3 border-t" style={{ borderColor: '#262626' }}>
                  <cite className="not-italic">
                    <div className="text-sm font-bold text-white">{t.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#A3A3A3' }}>
                      {t.title}
                    </div>
                  </cite>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-24 px-6" style={{ backgroundColor: '#BFFF00' }}>
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-5xl font-extrabold text-black tracking-tight">
            Ready to start?
          </h2>
          <p className="text-base text-black/60">
            Join thousands of users managing their finances smarter.
          </p>
          <Link to="/register">
            <button
              className="rounded-full text-sm font-bold px-8 py-4 transition-colors hover:bg-zinc-800"
              style={{ backgroundColor: '#0A0A0A', color: '#ffffff' }}
            >
              Get Started — It's Free
            </button>
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-10 px-6 border-t" style={{ backgroundColor: '#090909', borderColor: '#262626' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#BFFF00' }}
            >
              <span className="text-black font-bold text-xs">P</span>
            </div>
            <span className="font-semibold text-white text-xs">PennyWise</span>
          </div>
          <div className="flex gap-6 text-xs" style={{ color: '#525252' }}>
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
          <p className="text-xs" style={{ color: '#404040' }}>
            &copy; {new Date().getFullYear()} PennyWise
          </p>
        </div>
      </footer>
    </div>
  )
}
