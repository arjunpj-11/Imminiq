import type { ReactNode } from 'react'

import { AppShellBoundary } from '../../../components/layout/AppShell'

interface ActivityAppShellProps {
  children: ReactNode
  viewer?: {
    name: string
    avatarUrl?: string | null
    streak: number
    isPremium: boolean
  }
}

export default function ActivityAppShell({
  children,
  viewer,
}: ActivityAppShellProps) {
  return (
    <AppShellBoundary
      viewer={
        viewer
          ? {
              name: viewer.name,
              avatarUrl: viewer.avatarUrl,
              streak: viewer.streak,
              isPremium: viewer.isPremium,
            }
          : undefined
      }
    >
      {children}
    </AppShellBoundary>
  )
}
