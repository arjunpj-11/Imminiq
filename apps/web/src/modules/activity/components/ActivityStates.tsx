import { RefreshIcon } from './icons/ActivityIcons'

const SkeletonBlock = ({ className }: { className: string }) => (
  <div
    className={`animate-pulse rounded-full bg-[#e8ddd6] dark:bg-white/10 ${className}`}
  />
)

const FeedRowSkeleton = () => (
  <div className="flex animate-pulse items-center gap-3.5 border-b border-[#ece3db] px-5 py-3.5 last:border-b-0 dark:border-white/6">
    <div className="h-9 w-9 shrink-0 rounded-full bg-[#e8ddd6] dark:bg-white/10" />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="h-3.5 w-1/2 rounded bg-[#e8ddd6] dark:bg-white/10" />
      <div className="h-3 w-2/3 rounded bg-[#e8ddd6] dark:bg-white/10" />
    </div>
    <div className="h-3 w-14 rounded bg-[#e8ddd6] dark:bg-white/10" />
  </div>
)

export const ActivityContentSkeleton = () => (
  <div
    className="flex flex-col gap-7"
    role="status"
    aria-live="polite"
    aria-label="Loading activity"
  >
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1 space-y-3">
        <SkeletonBlock className="h-4 w-16" />
        <SkeletonBlock className="h-10 w-72 rounded-2xl" />
        <SkeletonBlock className="h-4 w-full max-w-96" />
      </div>
      <SkeletonBlock className="h-24 w-64 rounded-lg" />
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <SkeletonBlock key={index} className="h-32.5 rounded-2xl" />
      ))}
    </div>

    <SkeletonBlock className="h-52 rounded-lg" />

    <div className="flex items-start gap-5 max-[860px]:flex-col">
      <div className="min-w-0 flex-1 space-y-4">
        <SkeletonBlock className="h-10 w-80 rounded-xl" />
        <div className="overflow-hidden rounded-lg border-[1.5px] border-(--border-subtle) bg-(--surface-card) dark:border-(--border-subtle) dark:bg-(--surface-card)">
          {Array.from({ length: 6 }, (_, index) => (
            <FeedRowSkeleton key={index} />
          ))}
        </div>
      </div>

      <div className="w-62 space-y-3 max-[860px]:w-full">
        <SkeletonBlock className="h-36 rounded-2xl" />
        <SkeletonBlock className="h-64 rounded-2xl" />
      </div>
    </div>
  </div>
)

interface IActivityErrorStateProps {
  message?: string
  onRetry: () => void
}

export const ActivityErrorState = ({
  message,
  onRetry,
}: IActivityErrorStateProps) => (
  <div
    className="flex min-h-105 items-center justify-center px-4"
    role="alert"
  >
    <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.2)] bg-(--surface-card) p-8 text-center dark:bg-(--surface-card)">
      <h1 className="font-ui text-[22px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
        Activity unavailable
      </h1>
      <p className="mt-2 text-[13px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
        {message ||
          'Something went wrong loading your activity. Try again.'}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mx-auto mt-5 inline-flex items-center gap-2 rounded-lg bg-(--brand-500) px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#a64225] dark:bg-(--brand-500) dark:text-[#141412]"
      >
        <RefreshIcon /> Try again
      </button>
    </div>
  </div>
)
