// ============================================================
// MockTestSkeletons.tsx — light + dark theme matching Trackers
// ============================================================

import { cn } from '../utils/mock-tests-formatters'

export const SkeletonBlock = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'animate-pulse rounded-full bg-[#e8d9cf] dark:bg-white/8',
      className
    )}
  />
)

export const StatCardSkeleton = () => (
  <div className="rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]">
    <SkeletonBlock className="h-2.5 w-20" />
    <SkeletonBlock className="mt-5 h-9 w-24 rounded-2xl" />
    <SkeletonBlock className="mt-4 h-2.5 w-32" />
  </div>
)

export const TestRowSkeleton = () => (
  <div className="flex animate-pulse items-center gap-4 rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]">
    <div className="h-12 w-12 shrink-0 rounded-full bg-[#e8d9cf] dark:bg-white/8" />

    <div className="min-w-0 flex-1 space-y-2">
      <div className="h-4 w-2/3 rounded-lg bg-[#e8d9cf] dark:bg-white/8" />
      <div className="h-3 w-1/2 rounded bg-[#e8d9cf] dark:bg-white/8" />
    </div>

    <div className="hidden gap-2 sm:flex">
      <div className="h-8 w-20 rounded-[10px] bg-[#e8d9cf] dark:bg-white/8" />
      <div className="h-8 w-16 rounded-[10px] bg-[#e8d9cf] dark:bg-white/8" />
    </div>
  </div>
)