import { Link } from 'react-router-dom'

const LogoIcon = () => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0 rounded-[10px]"
  >
    <rect x="10" y="10" width="80" height="80" rx="18" fill="#050505" />

    <g transform="translate(-5,1)">
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

export default function FloatingStudioNav() {
  return (
    <div className="fixed bottom-3 left-1/2 z-1000 w-[min(520px,calc(100%-24px))] -translate-x-1/2">
      <div className="flex h-13 w-full items-center justify-between gap-3 rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5]/95 px-3 text-[#1a1714] shadow-[0_22px_60px_rgba(26,23,20,0.20)] backdrop-blur-xl dark:border-white/10 dark:bg-[#f2f0eb]/95 dark:text-[#141412]">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 no-underline"
          aria-label="Imminiq home"
        >
          <LogoIcon />

          <span className="truncate text-[14px] font-extrabold tracking-[-0.02em] text-[#1a1714] dark:text-[#141412]">
            Imminiq
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/login"
            className="rounded-xl border border-[#e0d0c5] px-3 py-1.75 text-[12px] font-bold text-[#1a1714] no-underline transition hover:-translate-y-px hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-black/10 dark:text-[#141412]"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-xl bg-[#e8816a] px-3 py-1.75 text-[12px] font-bold text-[#141412] no-underline transition hover:-translate-y-px hover:bg-[#f07058]"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}