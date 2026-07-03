import type { ReactNode } from 'react'

import { AppShellBoundary } from '../../../components/layout/AppShell'
import PageContainer from '../../../components/layout/PageContainer'

interface TrackerShellProps {
  children: ReactNode
  className?: string
}

export default function TrackerShell({ children, className }: TrackerShellProps) {
  return (
    <AppShellBoundary>
      <PageContainer className={className}>{children}</PageContainer>
    </AppShellBoundary>
  )
}
