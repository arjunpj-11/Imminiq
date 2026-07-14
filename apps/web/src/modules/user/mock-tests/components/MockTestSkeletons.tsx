// ============================================================
// MockTestSkeletons.tsx — light + dark theme matching Trackers
// ============================================================

import { cn } from '../utils/mock-tests-formatters';

export const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-full bg-[#e8d9cf] dark:bg-white/8', className)} />
);

export const StatCardSkeleton = () => (
  <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
    <SkeletonBlock className="h-2.5 w-20" />
    <SkeletonBlock className="mt-5 h-9 w-24 rounded-2xl" />
    <SkeletonBlock className="mt-4 h-2.5 w-32" />
  </div>
);

export const TestRowSkeleton = () => (
  <div className="flex animate-pulse items-center gap-4 rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-4 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
    <div className="h-12 w-12 shrink-0 rounded-full bg-[#e8d9cf] dark:bg-white/8" />

    <div className="min-w-0 flex-1 space-y-2">
      <div className="h-4 w-2/3 rounded-lg bg-[#e8d9cf] dark:bg-white/8" />
      <div className="h-3 w-1/2 rounded bg-[#e8d9cf] dark:bg-white/8" />
    </div>

    <div className="hidden gap-2 sm:flex">
      <div className="h-8 w-20 rounded-md bg-[#e8d9cf] dark:bg-white/8" />
      <div className="h-8 w-16 rounded-md bg-[#e8d9cf] dark:bg-white/8" />
    </div>
  </div>
);
