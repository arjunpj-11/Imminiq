import type { ReactNode } from 'react'

import { AppShellBoundary } from '../../../components/layout/AppShell'

interface CommunityLayoutProps {
  children: ReactNode
  loadingLabel?: string
}

export default function CommunityLayout({
  children,
  loadingLabel,
}: CommunityLayoutProps) {
  return (
    <AppShellBoundary>
      <div
        role={loadingLabel ? 'status' : undefined}
        aria-label={loadingLabel}
        className="contents"
      >
        {children}
      </div>
    </AppShellBoundary>
  )
}
