import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { useStreak } from '../../hooks/progress/useStreak'
import { cn } from '../../lib/cn'
import { useAuthStore } from '../../store/useAuthStore'
import { useAppShellStore } from '../../store/useAppShellStore'
import AppNoiseOverlay from './AppNoiseOverlay'
import BottomNav from './BottomNav'
import AppFooter from './Footer'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

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

interface AppShellContextValue {
  setViewer: (viewer: AppShellViewer | null) => void
}

const AppShellContext = createContext<AppShellContextValue | null>(null)

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'IM'

interface AppShellProps {
  children: ReactNode
  viewer?: AppShellViewer
  showSidebar?: boolean
  isGuest?: boolean
  withFooter?: boolean
  withBottomNav?: boolean
  className?: string
}

export function AppShell({
  children,
  viewer: initialViewer,
  showSidebar = true,
  isGuest = false,
  withFooter = true,
  withBottomNav = true,
  className,
}: AppShellProps) {
  const authUser = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const streakQuery = useStreak(undefined, {
    enabled: !isGuest && isAuthenticated,
  })
  const [pageViewer, setPageViewer] = useState<AppShellViewer | null>(
    initialViewer ?? null,
  )

  const mobileSidebarOpen = useAppShellStore(
    (state) => state.mobileSidebarOpen,
  )
  const sidebarCollapsed = useAppShellStore(
    (state) => state.sidebarCollapsed,
  )
  const openMobileSidebar = useAppShellStore(
    (state) => state.openMobileSidebar,
  )
  const closeMobileSidebar = useAppShellStore(
    (state) => state.closeMobileSidebar,
  )
  const toggleSidebarCollapsed = useAppShellStore(
    (state) => state.toggleSidebarCollapsed,
  )

  const contextValue = useMemo<AppShellContextValue>(
    () => ({ setViewer: setPageViewer }),
    [],
  )

  const fallbackName =
    authUser?.fullName || authUser?.username || (isGuest ? 'Guest' : 'Imminiq User')
  const userName = pageViewer?.name || initialViewer?.name || fallbackName
  const userAvatarUrl =
    pageViewer?.avatarUrl ?? initialViewer?.avatarUrl ?? authUser?.avatarUrl
  const userLevel =
    pageViewer?.levelLabel ||
    initialViewer?.levelLabel ||
    ((pageViewer?.isPremium ?? initialViewer?.isPremium ?? authUser?.isPremium)
      ? 'Imminiq Pro'
      : 'Free Scholar')

  return (
    <AppShellContext.Provider value={contextValue}>
      <div
        className={cn(
          "relative min-h-screen overflow-x-clip bg-[#f5ede4] font-['DM_Sans',sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]",
          className,
        )}
      >
        <AppNoiseOverlay />

        <div className="relative z-1 flex min-h-screen w-full overflow-x-clip">
          {showSidebar && (
            <Sidebar
              mobileOpen={mobileSidebarOpen}
              collapsed={sidebarCollapsed}
              onCloseMobile={closeMobileSidebar}
              onToggleCollapsed={toggleSidebarCollapsed}
            />
          )}

          <main
            className={cn(
              'flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300 ease-out',
              showSidebar && !sidebarCollapsed
                ? 'min-[901px]:ml-56'
                : 'min-[901px]:ml-0',
            )}
          >
            <TopBar
              onMenuClick={showSidebar ? openMobileSidebar : undefined}
              streakDays={
                streakQuery.data?.currentStreak ??
                pageViewer?.streak ??
                initialViewer?.streak ??
                0
              }
              userName={userName}
              userInitials={
                pageViewer?.initials ||
                initialViewer?.initials ||
                getInitials(userName)
              }
              {...(userAvatarUrl ? { userAvatarUrl } : {})}
              userLevel={userLevel}
              isGuest={isGuest}
              notificationCount={
                pageViewer?.notificationCount ??
                initialViewer?.notificationCount ??
                0
              }
              messageCount={
                pageViewer?.messageCount ?? initialViewer?.messageCount ?? 0
              }
              friendRequestCount={
                pageViewer?.friendRequestCount ??
                initialViewer?.friendRequestCount ??
                0
              }
            />

            <div className="flex min-w-0 flex-1 flex-col">
              {children}
              {withFooter && <AppFooter />}
            </div>
          </main>
        </div>

        {withBottomNav && showSidebar && !isGuest && <BottomNav />}
      </div>
    </AppShellContext.Provider>
  )
}

interface AppShellBoundaryProps extends AppShellProps {}

export function AppShellBoundary({
  children,
  viewer,
  ...standaloneProps
}: AppShellBoundaryProps) {
  const shell = useContext(AppShellContext)

  useEffect(() => {
    if (!shell) return

    shell.setViewer(viewer ?? null)
    return () => shell.setViewer(null)
  }, [
    shell,
    viewer?.avatarUrl,
    viewer?.friendRequestCount,
    viewer?.initials,
    viewer?.isPremium,
    viewer?.levelLabel,
    viewer?.messageCount,
    viewer?.name,
    viewer?.notificationCount,
    viewer?.streak,
  ])

  if (shell) {
    return <>{children}</>
  }

  return (
    <AppShell viewer={viewer} {...standaloneProps}>
      {children}
    </AppShell>
  )
}

export const useIsInsideAppShell = () => useContext(AppShellContext) !== null
