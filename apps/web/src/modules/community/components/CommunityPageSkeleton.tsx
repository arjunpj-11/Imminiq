import CommunityLayout from './CommunityLayout'
import { communityPageClass } from '../utils/community-ui'

interface ICommunityPageSkeletonProps {
  variant?: 'browse' | 'verify' | 'detail'
}

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-full bg-[#e8ddd6] dark:bg-white/10 ${className || ''}`} />
)

const TrackerCardSkeleton = () => (
  <div className="animate-pulse rounded-lg border-[1.5px] border-(--border-subtle) border-l-[3px] bg-(--surface-card) p-5 dark:border-(--border-subtle) dark:bg-(--surface-card)">
    <div className="mb-3 flex gap-2">
      <div className="h-5 w-16 rounded-full bg-[#e8ddd6] dark:bg-white/10" />
      <div className="h-5 w-16 rounded-full bg-[#e8ddd6] dark:bg-white/10" />
    </div>
    <div className="mb-2 h-5 w-3/4 rounded-lg bg-[#e8ddd6] dark:bg-white/10" />
    <div className="mb-1 h-3 w-full rounded bg-[#e8ddd6] dark:bg-white/10" />
    <div className="mb-4 h-3 w-2/3 rounded bg-[#e8ddd6] dark:bg-white/10" />
    <div className="flex items-center justify-between border-t border-[#e8ddd6] pt-3 dark:border-white/8">
      <div className="h-4 w-20 rounded bg-[#e8ddd6] dark:bg-white/10" />
      <div className="h-7 w-24 rounded-lg bg-[#e8ddd6] dark:bg-white/10" />
    </div>
  </div>
)

export default function CommunityPageSkeleton({
  variant = 'browse',
}: ICommunityPageSkeletonProps) {
  const cardCount = variant === 'verify' ? 4 : 6

  return (
    <CommunityLayout loadingLabel={`Loading community ${variant}`}>
      <div className={communityPageClass}>
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <SkeletonBlock className="h-5 w-24 rounded-full" />
            <SkeletonBlock className="h-9 w-[min(480px,100%)] rounded-2xl" />
            <SkeletonBlock className="h-4 w-[min(560px,100%)]" />
          </div>
          <SkeletonBlock className="h-10 w-36 rounded-md" />
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-30 animate-pulse rounded-2xl bg-[#e8ddd6] dark:bg-white/10"
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 max-[860px]:grid-cols-2 max-[540px]:grid-cols-1">
          {Array.from({ length: cardCount }).map((_, index) => (
            <TrackerCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </CommunityLayout>
  )
}
