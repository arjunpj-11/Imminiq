import { cn } from '../../lib/cn';

interface ISkeletonBlockProps {
  className?: string;
}

export default function SkeletonBlock({ className }: ISkeletonBlockProps) {
  return (
    <div aria-hidden="true" className={cn('shimmer rounded-sm bg-(--surface-muted)', className)} />
  );
}
