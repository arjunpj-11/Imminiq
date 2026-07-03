import { Link } from 'react-router-dom'

import ImminiqLogo from '../../../components/ui/ImminiqLogo'
import ImminiqWordmark from '../../../components/ui/ImminiqWordmark'

export default function FloatingStudioNav() {
  return (
    <div className="fixed bottom-3 left-1/2 z-1000 w-[min(520px,calc(100%-24px))] -translate-x-1/2">
      <div className="flex h-13 w-full items-center justify-between gap-3 rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5]/95 px-3 text-[#1a1714] shadow-[0_22px_60px_rgba(26,23,20,0.20)] backdrop-blur-xl dark:border-white/10 dark:bg-[#f2f0eb]/95 dark:text-[#141412]">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 no-underline"
          aria-label="Imminiq home"
        >
          <ImminiqLogo size={34} className="rounded-[10px]" decorative />

          <ImminiqWordmark
            className="truncate text-[14px] font-extrabold tracking-[-0.02em]"
            prefixClassName="text-[#1a1714] dark:text-[#141412]"
          />
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