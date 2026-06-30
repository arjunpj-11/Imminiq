import { RefreshIcon } from './icons/LeaderboardIcons'

const SkeletonBlock = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-full bg-[#e8ddd6] dark:bg-white/10 ${className}`} />
)

const RowSkeleton = () => (
  <div className="flex animate-pulse items-center gap-4 border-b border-[#e8ddd6] px-5 py-3.5 last:border-b-0 dark:border-white/8">
    <div className="h-3 w-8 shrink-0 rounded bg-[#e8ddd6] dark:bg-white/10" />
    <div className="h-9 w-9 shrink-0 rounded-full bg-[#e8ddd6] dark:bg-white/10" />
    <div className="min-w-0 flex-1 space-y-1.5">
      <div className="h-3.5 w-1/3 rounded bg-[#e8ddd6] dark:bg-white/10" />
      <div className="h-3 w-1/4 rounded bg-[#e8ddd6] dark:bg-white/10" />
    </div>
    <div className="h-3 w-12 rounded bg-[#e8ddd6] dark:bg-white/10" />
    <div className="h-3 w-8 rounded bg-[#e8ddd6] dark:bg-white/10" />
  </div>
)

export const LeaderboardContentSkeleton = () => (
  <div role="status" aria-live="polite" aria-label="Loading leaderboard" className="flex flex-col gap-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1 space-y-3">
        <SkeletonBlock className="h-4 w-16" />
        <SkeletonBlock className="h-10 w-72 rounded-2xl" />
        <SkeletonBlock className="h-4 w-full max-w-96" />
      </div>
      <SkeletonBlock className="h-28 w-64 rounded-[18px]" />
    </div>

    <div className="flex gap-2.5">
      <SkeletonBlock className="h-16 w-44 rounded-[14px]" />
      <SkeletonBlock className="h-16 w-44 rounded-[14px]" />
    </div>

    <div className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] dark:border-white/9 dark:bg-[#1e1c19]">
      {Array.from({ length: 7 }, (_, index) => <RowSkeleton key={index} />)}
    </div>
  </div>
)

interface LeaderboardErrorStateProps {
  message?: string | undefined
  onRetry: () => void
}

export const LeaderboardErrorState = ({
  message,
  onRetry,
}: LeaderboardErrorStateProps) => (
  <div className="flex min-h-[420px] items-center justify-center px-4" role="alert">
    <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.2)] bg-[#fdf8f5] p-8 text-center dark:bg-[#1e1c19]">
      <h1 className="font-['Playfair_Display',serif] text-[22px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">Leaderboard unavailable</h1>
      <p className="mt-2 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">{message || 'Something went wrong loading the leaderboard data. Try again.'}</p>
      <button type="button" onClick={onRetry} className="mx-auto mt-5 inline-flex items-center gap-2 rounded-lg bg-[#b84c2b] px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#a64225] dark:bg-[#e8816a] dark:text-[#141412]">
        <RefreshIcon /> Try again
      </button>
    </div>
  </div>
)
