import type { ReactNode } from 'react'

import { AppShellBoundary } from '../../../components/layout/AppShell'

interface FriendsAppShellProps {
  children: ReactNode
}

export default function FriendsAppShell({ children }: FriendsAppShellProps) {
  return <AppShellBoundary>{children}</AppShellBoundary>
}
