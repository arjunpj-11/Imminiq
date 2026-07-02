import type { ElementType, ReactNode } from 'react'

import { cn } from '../../lib/cn'

interface PageContainerProps {
  children: ReactNode
  className?: string
  as?: ElementType
}

export default function PageContainer({
  children,
  className,
  as: Component = 'div',
}: PageContainerProps) {
  return (
    <Component
      className={cn(
        'mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]',
        className,
      )}
    >
      {children}
    </Component>
  )
}
