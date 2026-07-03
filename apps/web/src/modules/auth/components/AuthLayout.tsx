import { Link } from 'react-router-dom'
import { LogoIcon } from './icons/AuthIcons'
import { cn } from '../utils/auth-ui'

interface AuthLayoutProps {
  badge: string
  title: string
  subtitle: string
  children: React.ReactNode
}

export default function AuthLayout({ badge, title, subtitle, children }: AuthLayoutProps) {
  return (
    <div
      id="page"
      className={cn(
        'min-h-screen bg-(--surface-canvas) text-(--text-primary) font-[DM_Sans,sans-serif]',
        'dark:bg-(--surface-canvas) dark:text-(--text-primary)',
        'lg:fixed lg:inset-0 lg:flex lg:flex-col lg:overflow-hidden'
      )}
    >
      <div className="flex shrink-0 items-center justify-between px-4 pt-5 sm:px-8 sm:pt-7 lg:hidden">
        <Link to="/" className="inline-flex items-center gap-2.5 leading-none">
          <LogoIcon className="h-9 w-9 rounded-md sm:h-10 sm:w-10" />
          <span className="text-[22px] font-bold leading-none tracking-[-0.5px] text-(--text-primary) dark:text-(--text-primary) sm:text-2xl">
            immin<span className="text-(--brand-500) dark:text-(--brand-500)">iq</span>
            <span className="text-(--brand-500) dark:text-(--brand-500)">.</span>
          </span>
        </Link>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 font-mono text-[8.5px] font-medium uppercase tracking-[0.07em] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-(--brand-500) sm:text-[9px]">
          <span className="h-1.25 w-1.25 rounded-full bg-(--brand-500) dark:bg-(--brand-500)" />
          {badge}
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        <aside className="relative hidden w-1/2 min-w-0 flex-1 overflow-hidden px-14 py-12 lg:flex lg:flex-col lg:justify-between xl:px-18 xl:py-13" aria-hidden="true">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.09)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(232,129,106,0.13)_0%,transparent_70%)]" />
          <Link to="/" className="relative z-1 inline-flex items-center gap-3 leading-none">
            <LogoIcon className="h-11 w-11" />
            <span className="text-[27px] font-bold tracking-[-0.7px]">
              immin<span className="text-(--brand-500) dark:text-(--brand-500)">iq</span>
              <span className="text-(--brand-500) dark:text-(--brand-500)">.</span>
            </span>
          </Link>
          <div className="relative z-1 max-w-135">
            <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.18em] text-(--brand-500) dark:text-(--brand-500)">
              Scholarly rigor meets digital intelligence
            </p>
            <h2 className="font-serif text-[clamp(40px,5vw,64px)] font-extrabold leading-[1.02] tracking-[-1.6px]">
              Learn with structure, speed, and confidence.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-[1.8] text-(--text-secondary) dark:text-(--text-secondary)">
              Sign in to continue your roadmap, progress streaks, battles, and AI-guided practice.
            </p>
          </div>
          <div className="relative z-1 font-mono text-[9px] uppercase tracking-[0.13em] text-(--text-secondary) opacity-60 dark:text-(--text-secondary)">
            Private by design · Secure sessions · AI-powered learning
          </div>
        </aside>

        <main className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.06)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(232,129,106,0.10)_0%,transparent_70%)]" />
          <div className="relative w-full max-w-120">
            <div className="w-full rounded-xl border border-(--border-subtle) bg-(--surface-card) px-5 py-8 shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-(--surface-card) dark:shadow-[0_18px_60px_rgba(0,0,0,0.45),0_0_40px_rgba(232,129,106,0.07)] sm:px-9 sm:py-10">
              <div className="mb-7 text-center">
                <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-(--text-secondary) dark:text-(--text-secondary)">
                  {badge}
                </div>
                <h1 className="font-serif text-[clamp(24px,5vw,31px)] font-bold tracking-[-0.5px] text-(--text-primary) dark:text-(--text-primary)">
                  {title}
                </h1>
                <p className="mt-2 text-[13px] leading-[1.65] text-(--text-secondary) dark:text-(--text-secondary)">
                  {subtitle}
                </p>
              </div>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
