import { createContext } from 'react'

export interface AppShellViewer {
  name?: string
  initials?: string
  avatarUrl?: string | null
  streak?: number
  levelLabel?: string
  isPremium?: boolean
  notificationCount?: number
  messageCount?: number
  friendRequestCount?: number
}

export interface AppShellContextValue {
  setViewer: (viewer: AppShellViewer | null) => void
}

export const AppShellContext =
  createContext<AppShellContextValue | null>(null)