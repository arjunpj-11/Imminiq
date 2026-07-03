import { cn } from '../../lib/cn'

interface SkeletonBlockProps {
  className?: string
}

export default function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'shimmer rounded-sm bg-(--surface-muted)',
        className,
      )}
    />
  )
}
