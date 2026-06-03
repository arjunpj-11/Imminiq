// ============================================================
// MockTestSkeletons.tsx — dark theme matching Trackers
// ============================================================
import { cn } from '../utils/mock-tests-formatters'

export const SkeletonBlock = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'animate-pulse rounded-full bg-white/8',
      className
    )}
  />
)

export const StatCardSkeleton = () => (
  <div className="rounded-[16px] border border-white/10 bg-[#1c1a18] p-5">
    <SkeletonBlock className="h-2.5 w-20" />
    <SkeletonBlock className="mt-5 h-9 w-24 rounded-2xl" />
    <SkeletonBlock className="mt-4 h-2.5 w-32" />
  </div>
)

export const TestRowSkeleton = () => (
  <div className="flex animate-pulse items-center gap-4 rounded-[16px] border border-white/10 bg-[#1c1a18] p-4">
    <div className="h-12 w-12 flex-shrink-0 rounded-full bg-white/8" />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="h-4 w-2/3 rounded-lg bg-white/8" />
      <div className="h-3 w-1/2 rounded bg-white/8" />
    </div>
    <div className="hidden gap-2 sm:flex">
      <div className="h-8 w-20 rounded-[10px] bg-white/8" />
      <div className="h-8 w-16 rounded-[10px] bg-white/8" />
    </div>
  </div>
)