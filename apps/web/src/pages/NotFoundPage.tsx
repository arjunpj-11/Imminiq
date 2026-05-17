import { useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ui/ThemeToggle'

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(' ')
}

const LogoIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={cn('block shrink-0 rounded-xl', className)}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="10" y="10" width="80" height="80" rx="18" fill="#050505" />
      <g transform="translate(-5, 1)">
        <rect x="31" y="35" width="9" height="34" rx="4.5" fill="#fff8ed" />
        <circle cx="35.5" cy="28.5" r="5.3" fill="#f15a35" />
        <path
          d="M64 32.8C73.8 34.7 79.5 42.2 79.5 51.5 79.5 61.8 71.2 68 60.2 68c-7 0-12-2.5-15.1-7.2"
          fill="none"
          stroke="#fff8ed"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <line
          x1="63.8"
          y1="55.5"
          x2="75.8"
          y2="67.5"
          stroke="#f15a35"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

const HomeIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

const DashboardIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}

const RoadmapIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

const MockTestIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  )
}

const LeaderboardIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

const CommunityIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}

const CompassIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  )
}

export default function NotFoundPage() {
  const [toast, setToast] = useState('')
  const [isToastVisible, setIsToastVisible] = useState(false)

  const showToast = (message: string) => {
    setToast(message)
    setIsToastVisible(true)

    window.setTimeout(() => {
      setIsToastVisible(false)
    }, 2600)
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f5ede4] font-[DM_Sans,sans-serif] text-[#1a1714] transition-colors dark:bg-[#141412] dark:text-[#f2f0eb]">
      {/* Background Grain */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] dark:opacity-[0.04]">
        <div className="h-full w-full bg-[url('data:image/svg+xml,%3Csvg_viewBox=%270_0_200_200%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter_id=%27n%27%3E%3CfeTurbulence_type=%27fractalNoise%27_baseFrequency=%270.9%27_numOctaves=%274%27_stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect_width=%27100%25%27_height=%27100%25%27_filter=%27url(%23n)%27_opacity=%271%27/%3E%3C/svg%3E')] bg-size-[180px_180px]" />
      </div>

      {/* Toast */}
      <div
        className={cn(
          'pointer-events-none fixed bottom-7 left-1/2 z-200 -translate-x-1/2 translate-y-5 whitespace-nowrap rounded-full bg-[#1a1714] px-4.5 py-2.5 text-[13px] font-medium text-[#f5ede4] opacity-0 shadow-[0_16px_56px_rgba(0,0,0,0.4)] transition-all duration-300',
          'dark:bg-[#f2f0eb] dark:text-[#141412]',
          isToastVisible && 'translate-y-0 opacity-100'
        )}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>

      {/* Top Bar */}
      <header className="sticky top-0 z-20 flex h-13.5 items-center justify-between border-b border-[#e0d0c5] bg-[rgba(245,237,228,0.92)] px-4 shadow-[0_1px_0_rgba(253,248,245,0.6)] backdrop-blur-2xl sm:px-8 lg:px-10 dark:border-white/10 dark:bg-[rgba(20,20,18,0.92)] dark:shadow-[0_1px_0_rgba(30,28,25,0.6)]">
        <Link className="flex items-center gap-2.5 no-underline" to="/">
          <LogoIcon className="h-7.5 w-7.5 rounded-[9px]" />

          <span className="font-serif text-[22px] font-extrabold leading-none tracking-[-0.5px] text-[#1a1714] dark:text-[#f2f0eb]">
            immin<span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[#6b5f58] transition hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] sm:block dark:text-[#9b9a92] dark:hover:bg-[rgba(232,129,106,0.1)] dark:hover:text-[#e8816a]"
            onClick={() => showToast('Help page can be linked later.')}
          >
            Help
          </button>

          <button
            type="button"
            className="hidden rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[#6b5f58] transition hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] md:block dark:text-[#9b9a92] dark:hover:bg-[rgba(232,129,106,0.1)] dark:hover:text-[#e8816a]"
            onClick={() =>
              showToast('Community guidelines page can be linked later.')
            }
          >
            Community Guidelines
          </button>

          <ThemeToggle />

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-[9px] bg-[#1a1714] px-4 py-2 text-xs font-semibold text-[#f5ede4] transition hover:-translate-y-px hover:opacity-85 dark:bg-[#f2f0eb] dark:text-[#141412]"
          >
            <HomeIcon />
            Go home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative z-10 flex min-h-[calc(100vh-54px)] flex-col items-center justify-center overflow-hidden px-4 pb-10 pt-10 sm:px-8 lg:px-12"
        aria-label="404 error"
      >
        {/* Background Blur Shapes */}
        <div className="pointer-events-none absolute left-[-8%] top-[8%] h-80 w-80 rounded-full bg-[#b84c2b]/12 blur-3xl dark:bg-[#e8816a]/7" />
        <div className="pointer-events-none absolute bottom-[12%] right-[-6%] h-60 w-60 rounded-full bg-[#3b6cb7]/12 blur-3xl dark:bg-[#6b9fe8]/7" />
        <div className="pointer-events-none absolute left-[38%] top-[55%] h-40 w-40 rounded-full bg-[#c98000]/12 blur-3xl dark:bg-[#f0a842]/7" />

        {/* Compass */}
        <div className="pointer-events-none absolute right-[18%] top-[38%] hidden animate-[floatY_5s_ease-in-out_infinite] text-[#b84c2b]/20 md:block dark:text-[#e8816a]/18">
          <CompassIcon className="h-24 w-24" />
        </div>

        {/* Big 404 */}
        <div className="relative mb-2 select-none">
          <span className="absolute inset-0 translate-x-1 translate-y-1 font-serif text-[clamp(120px,20vw,200px)] font-extrabold leading-none tracking-[-8px] text-[#b84c2b]/7 dark:text-[#e8816a]/7">
            404
          </span>

          <h1 className="relative font-serif text-[clamp(120px,20vw,200px)] font-extrabold leading-none tracking-[-8px] text-[#1a1714] dark:text-[#f2f0eb]">
            404
          </h1>
        </div>

        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.18em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
          <span className="h-1.25 w-1.25 rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />
          Page not found
        </div>

        {/* Heading */}
        <h2 className="mb-3 text-center font-serif text-[clamp(22px,3.5vw,32px)] font-extrabold leading-[1.2] tracking-[-0.5px] text-[#1a1714] dark:text-[#f2f0eb]">
          Looks like this page took a wrong turn
        </h2>

        <p className="mx-auto mb-8 max-w-100 text-center text-sm leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
          The page you are looking for does not exist, may have been moved, or
          the URL might contain a typo. Let’s get you back on track.
        </p>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-[10px] border-[1.5px] border-[#b84c2b] bg-[#b84c2b] px-4 py-2 text-[12.5px] font-semibold text-[#fdf8f5] shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[#963d22] hover:bg-[#963d22] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-[#e8816a] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:border-[#d4705a] dark:hover:bg-[#d4705a]"
          >
            <DashboardIcon />
            Dashboard
          </Link>

          <Link
            to="/community"
            className="inline-flex items-center gap-1.5 rounded-[10px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-4 py-2 text-[12.5px] font-semibold text-[#6b5f58] shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/10 dark:bg-[#1e1c19] dark:text-[#9b9a92] dark:hover:border-[#e8816a] dark:hover:bg-[rgba(232,129,106,0.10)] dark:hover:text-[#e8816a]"
          >
            <CommunityIcon />
            Community
          </Link>

          <button
            type="button"
            onClick={() => showToast('Roadmaps page can be linked later.')}
            className="inline-flex items-center gap-1.5 rounded-[10px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-4 py-2 text-[12.5px] font-semibold text-[#6b5f58] shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/10 dark:bg-[#1e1c19] dark:text-[#9b9a92] dark:hover:border-[#e8816a] dark:hover:bg-[rgba(232,129,106,0.10)] dark:hover:text-[#e8816a]"
          >
            <RoadmapIcon />
            Roadmaps
          </button>

          <button
            type="button"
            onClick={() => showToast('Mock tests page can be linked later.')}
            className="inline-flex items-center gap-1.5 rounded-[10px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-4 py-2 text-[12.5px] font-semibold text-[#6b5f58] shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/10 dark:bg-[#1e1c19] dark:text-[#9b9a92] dark:hover:border-[#e8816a] dark:hover:bg-[rgba(232,129,106,0.10)] dark:hover:text-[#e8816a]"
          >
            <MockTestIcon />
            Mock Tests
          </button>

          <button
            type="button"
            onClick={() => showToast('Leaderboard page can be linked later.')}
            className="inline-flex items-center gap-1.5 rounded-[10px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-4 py-2 text-[12.5px] font-semibold text-[#6b5f58] shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/10 dark:bg-[#1e1c19] dark:text-[#9b9a92] dark:hover:border-[#e8816a] dark:hover:bg-[rgba(232,129,106,0.10)] dark:hover:text-[#e8816a]"
          >
            <LeaderboardIcon />
            Leaderboard
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#e0d0c5] bg-[rgba(245,237,228,0.92)] px-4 py-4.5 shadow-[0_-1px_0_rgba(253,248,245,0.6)] backdrop-blur-2xl sm:px-8 lg:px-10 dark:border-white/10 dark:bg-[rgba(20,20,18,0.92)] dark:shadow-[0_-1px_0_rgba(30,28,25,0.6)]">
        <div className="font-serif text-base font-extrabold text-[#b84c2b] dark:text-[#e8816a]">
          Imminiq
        </div>

        <div className="flex flex-wrap gap-5">
          <button
            type="button"
            onClick={() => showToast('Privacy page can be linked later.')}
            className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-[#6b5f58]/50 transition hover:text-[#b84c2b] hover:opacity-100 dark:text-[#9b9a92]/50 dark:hover:text-[#e8816a]"
          >
            Privacy Policy
          </button>

          <button
            type="button"
            onClick={() => showToast('Terms page can be linked later.')}
            className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-[#6b5f58]/50 transition hover:text-[#b84c2b] hover:opacity-100 dark:text-[#9b9a92]/50 dark:hover:text-[#e8816a]"
          >
            Terms of Service
          </button>

          <button
            type="button"
            onClick={() =>
              showToast('Academic Integrity page can be linked later.')
            }
            className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-[#6b5f58]/50 transition hover:text-[#b84c2b] hover:opacity-100 dark:text-[#9b9a92]/50 dark:hover:text-[#e8816a]"
          >
            Academic Integrity
          </button>

          <button
            type="button"
            onClick={() => showToast('Contact page can be linked later.')}
            className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-[#6b5f58]/50 transition hover:text-[#b84c2b] hover:opacity-100 dark:text-[#9b9a92]/50 dark:hover:text-[#e8816a]"
          >
            Contact
          </button>
        </div>

        <div className="font-mono text-[8.5px] tracking-[0.06em] text-[#6b5f58]/40 dark:text-[#9b9a92]/40">
          © 2026 Imminiq. Scholarly Rigor, Digital Craft.
        </div>
      </footer>
    </div>
  )
}