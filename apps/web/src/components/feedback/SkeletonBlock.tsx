import { cn } from '../../lib/cn'

interface SkeletonBlockProps {
  className?: string
}

export default function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-lg bg-[#e8d8cf] dark:bg-white/10',
        className,
      )}
    />
  )
}
