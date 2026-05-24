import { Link } from 'react-router-dom'

export default function FloatingStudioNav() {
  return (
    <div className="fixed bottom-3 left-1/2 z-1000 w-[min(520px,calc(100%-24px))] -translate-x-1/2">
      <div className="flex h-13 w-full items-center justify-between gap-3 rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5]/95 px-3 text-[#1a1714] shadow-[0_22px_60px_rgba(26,23,20,0.20)] backdrop-blur-xl dark:border-white/10 dark:bg-[#f2f0eb]/95 dark:text-[#141412]">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Imminiq home">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#1a1714] text-[#fdf8f5] dark:bg-[#141412]">
            <img
              src="/logo.svg"
              alt=""
              className="h-5 w-5 object-contain"
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
            />
          </span>
          <span className="truncate text-[14px] font-extrabold tracking-[-0.02em]">
            Imminiq
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/login"
            className="rounded-xl border border-[#e0d0c5] px-3 py-1.75 text-[12px] font-bold text-[#1a1714] transition hover:-translate-y-px hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-black/10 dark:text-[#141412]"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-[#b84c2b] px-3 py-1.75 text-[12px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#963d22] dark:bg-[#e8816a] dark:text-[#141412]"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
