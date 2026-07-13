import type { ReactNode } from 'react'

import { AppShellBoundary } from '../../../../components/layout/AppShell'
import PageContainer from '../../../../components/layout/PageContainer'

interface ITrackerShellProps {
  children: ReactNode
  className?: string
}

export default function TrackerShell({ children, className }: ITrackerShellProps) {
  return (
    <AppShellBoundary>
      <PageContainer className={className}>{children}</PageContainer>
    </AppShellBoundary>
  )
}
