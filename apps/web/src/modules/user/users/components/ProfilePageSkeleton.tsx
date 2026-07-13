import { AppShellBoundary } from '../../../../components/layout/AppShell';
import { cn } from '../../../../lib/cn';
import ProfileDocumentStyles from './ProfileDocumentStyles';

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-full bg-[#e8d8cf] dark:bg-white/10', className)} />
  );
}

export default function ProfilePageSkeleton({ showSidebar }: { showSidebar: boolean }) {
  return (
    <AppShellBoundary
      showSidebar={showSidebar}
      isGuest={!showSidebar}
      viewer={{ name: 'Loading Profile', initials: 'IM', levelLabel: 'Loading' }}
    >
      <div role="status" aria-live="polite" aria-label="Loading profile">
        <ProfileDocumentStyles />

        <div className="profile-page flex min-w-0 flex-1 flex-col overflow-x-clip">
          <div className="mx-auto mt-5.5 w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
            <div
              className="relative overflow-hidden rounded-t-[22px] bg-[var(--surface-card)] dark:bg-[var(--surface-card)] max-[640px]:rounded-t-2xl"
              style={{ aspectRatio: '4 / 1' }}
            >
              <div className="absolute inset-0 animate-pulse bg-[#e8d8cf] dark:bg-white/10" />
            </div>

            <div className="border-x border-b border-[var(--border-subtle)] bg-[var(--surface-card)] px-7 pb-5.5 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-card)] max-[640px]:px-4">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-4 max-[640px]:flex-col max-[640px]:gap-3">
                  <div className="relative z-20 shrink-0 -mt-18 max-[640px]:-mt-13.5">
                    <div className="h-25 w-25 animate-pulse rounded-full border-4 border-[#fdf8f5] bg-[#e8d8cf] shadow-[0_4px_24px_rgba(26,23,20,0.18)] dark:border-[#1e1c19] dark:bg-white/10 max-[640px]:h-23 max-[640px]:w-23" />
                  </div>

                  <div className="min-w-0 flex-1 pt-2 max-[640px]:pt-0">
                    <SkeletonBlock className="h-8 w-64 max-w-full rounded-2xl" />
                    <SkeletonBlock className="mt-3 h-3 w-32" />
                    <SkeletonBlock className="mt-3 h-4 w-80 max-w-full" />

                    <div className="mt-4 flex flex-wrap gap-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <SkeletonBlock key={index} className="h-7 w-28" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex translate-y-1.5 items-center gap-2 max-[900px]:w-full max-[900px]:translate-y-0 max-[640px]:flex-wrap">
                  <SkeletonBlock className="h-10 w-32 rounded-[var(--radius-md)] max-[640px]:flex-[1_1_150px]" />
                  <SkeletonBlock className="h-10 w-40 rounded-[var(--radius-md)] max-[640px]:flex-[1_1_170px]" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 py-6 max-[640px]:py-5 max-[900px]:pb-[calc(80px+env(safe-area-inset-bottom,0))]">
              <div className="grid grid-cols-4 gap-2.5 max-[860px]:grid-cols-2 max-[420px]:grid-cols-1">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[var(--radius-lg)] border-[1.5px] border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-1)] dark:border-[var(--border-subtle)] dark:bg-[var(--surface-card)]"
                  >
                    <SkeletonBlock className="h-3 w-24" />
                    <SkeletonBlock className="mt-5 h-9 w-28 rounded-2xl" />
                    <SkeletonBlock className="mt-4 h-9 w-full rounded-xl" />
                  </div>
                ))}
              </div>

              <div className="rounded-[var(--radius-lg)] border-[1.5px] border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-1)] dark:border-[var(--border-subtle)] dark:bg-[var(--surface-card)]">
                <SkeletonBlock className="h-7 w-44 rounded-2xl" />
                <div className="mt-5 space-y-3">
                  <SkeletonBlock className="h-4 w-full" />
                  <SkeletonBlock className="h-4 w-11/12" />
                  <SkeletonBlock className="h-4 w-3/4" />
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <SkeletonBlock key={index} className="h-8 w-24 rounded-lg" />
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  <SkeletonBlock className="h-3 w-24" />
                  <SkeletonBlock className="h-4 w-56" />
                  <SkeletonBlock className="h-4 w-48" />
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <SkeletonBlock key={index} className="h-8 w-24 rounded-lg" />
                  ))}
                </div>
              </div>

              <div className="rounded-[var(--radius-lg)] border-[1.5px] border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-1)] dark:border-[var(--border-subtle)] dark:bg-[var(--surface-card)]">
                <SkeletonBlock className="h-6 w-44 rounded-2xl" />
                <SkeletonBlock className="mt-5 h-36 w-full rounded-2xl" />
              </div>

              <div>
                <div className="mb-3.5 flex items-center justify-between">
                  <SkeletonBlock className="h-7 w-52 rounded-2xl" />
                </div>

                <div className="grid grid-cols-3 gap-3.5 max-[860px]:grid-cols-2 max-[640px]:grid-cols-1">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-[var(--radius-lg)] border-[1.5px] border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-card)]"
                    >
                      <SkeletonBlock className="h-32 w-full rounded-2xl" />
                      <SkeletonBlock className="mt-4 h-5 w-3/4 rounded-xl" />
                      <SkeletonBlock className="mt-3 h-4 w-full" />
                      <SkeletonBlock className="mt-2 h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <span className="sr-only">Loading profile content</span>
      </div>
    </AppShellBoundary>
  );
}
