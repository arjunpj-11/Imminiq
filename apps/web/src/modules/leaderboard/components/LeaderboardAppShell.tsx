import type { ReactNode } from 'react'

import { AppShellBoundary } from '../../../components/layout/AppShell'

interface ILeaderboardAppShellProps {
  children: ReactNode
  viewer?: {
    name: string
    initials: string
    avatarUrl: string | null | undefined
    streak: number
    levelLabel: string
  }
}

export default function LeaderboardAppShell({
  children,
  viewer,
}: ILeaderboardAppShellProps) {
  return (
    <AppShellBoundary
      viewer={
        viewer
          ? {
              name: viewer.name,
              initials: viewer.initials,
              avatarUrl: viewer.avatarUrl,
              streak: viewer.streak,
              levelLabel: viewer.levelLabel,
            }
          : undefined
      }
    >
      {children}
    </AppShellBoundary>
  )
}
