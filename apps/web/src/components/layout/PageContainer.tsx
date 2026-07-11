import type { ElementType, ReactNode } from 'react'

import { cn } from '../../lib/cn'

interface IPageContainerProps {
  children: ReactNode
  className?: string
  as?: ElementType
  density?: 'comfortable' | 'compact'
}

export default function PageContainer({
  children,
  className,
  as: Component = 'div',
  density = 'comfortable',
}: IPageContainerProps) {
  return (
    <Component
      className={cn(
        'mx-auto flex w-[min(var(--content-max),calc(100%-48px))] max-w-full min-w-0 flex-col pb-[calc(80px+env(safe-area-inset-bottom,0)+18px)] max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:w-[calc(100%-20px)]',
        density === 'comfortable'
          ? 'mt-6 gap-6 max-[900px]:mt-5 max-[640px]:mt-4 max-[640px]:gap-4'
          : 'mt-4 gap-4 max-[640px]:mt-3 max-[640px]:gap-3',
        className,
      )}
    >
      {children}
    </Component>
  )
}
