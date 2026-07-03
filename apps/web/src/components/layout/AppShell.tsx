import {
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { useStreak } from '../../hooks/progress/useStreak'
import { cn } from '../../lib/cn'
import { useAppShellStore } from '../../store/useAppShellStore'
import { useAuthStore } from '../../store/useAuthStore'
import AppNoiseOverlay from './AppNoiseOverlay'
import {
  AppShellContext,
  type AppShellContextValue,
  type AppShellViewer,
} from './AppShellContext'
import BottomNav from './BottomNav'
import AppFooter from './Footer'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export type { AppShellViewer } from './AppShellContext'

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
  withTopBar?: boolean
  withFooter?: boolean
  withBottomNav?: boolean
  className?: string
}

export function AppShell({
  children,
  viewer: initialViewer,
  showSidebar = true,
  isGuest = false,
  withTopBar = true,
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
    () => ({
      setViewer: setPageViewer,
    }),
    [],
  )

  const fallbackName =
    authUser?.fullName ||
    authUser?.username ||
    (isGuest ? 'Guest' : 'Imminiq User')

  const userName =
    pageViewer?.name ||
    initialViewer?.name ||
    fallbackName

  const userAvatarUrl =
    pageViewer?.avatarUrl ??
    initialViewer?.avatarUrl ??
    authUser?.avatarUrl

  const isPremium =
    pageViewer?.isPremium ??
    initialViewer?.isPremium ??
    authUser?.isPremium

  const userLevel =
    pageViewer?.levelLabel ||
    initialViewer?.levelLabel ||
    (isPremium ? 'Imminiq Pro' : 'Free Scholar')

  return (
    <AppShellContext.Provider value={contextValue}>
      <div
        className={cn(
          'relative min-h-screen overflow-x-clip bg-(--surface-canvas) font-ui text-(--text-primary) dark:bg-(--surface-canvas) dark:text-(--text-primary)',
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
            id="main-content"
            tabIndex={-1}
            className={cn(
              'flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300 ease-out',
              showSidebar && !sidebarCollapsed
                ? 'min-[901px]:ml-56'
                : 'min-[901px]:ml-0',
            )}
          >
            {withTopBar && (
              <TopBar
                onMenuClick={
                  showSidebar ? openMobileSidebar : undefined
                }
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
                  pageViewer?.messageCount ??
                  initialViewer?.messageCount ??
                  0
                }
                friendRequestCount={
                  pageViewer?.friendRequestCount ??
                  initialViewer?.friendRequestCount ??
                  0
                }
              />
            )}

            <div className="flex min-w-0 flex-1 flex-col">
              {children}

              {withFooter && <AppFooter />}
            </div>
          </main>
        </div>

        {withBottomNav && showSidebar && !isGuest && (
          <BottomNav />
        )}
      </div>
    </AppShellContext.Provider>
  )
}

export function AppShellBoundary({
  children,
  viewer,
  ...standaloneProps
}: AppShellProps) {
  const shell = useContext(AppShellContext)

  const viewerName = viewer?.name
  const viewerInitials = viewer?.initials
  const viewerAvatarUrl = viewer?.avatarUrl
  const viewerStreak = viewer?.streak
  const viewerLevelLabel = viewer?.levelLabel
  const viewerIsPremium = viewer?.isPremium
  const viewerNotificationCount = viewer?.notificationCount
  const viewerMessageCount = viewer?.messageCount
  const viewerFriendRequestCount = viewer?.friendRequestCount
  const hasViewer = viewer !== undefined

  const stableViewer = useMemo<AppShellViewer | null>(() => {
    if (!hasViewer) {
      return null
    }

    return {
      ...(viewerName !== undefined
        ? { name: viewerName }
        : {}),
      ...(viewerInitials !== undefined
        ? { initials: viewerInitials }
        : {}),
      ...(viewerAvatarUrl !== undefined
        ? { avatarUrl: viewerAvatarUrl }
        : {}),
      ...(viewerStreak !== undefined
        ? { streak: viewerStreak }
        : {}),
      ...(viewerLevelLabel !== undefined
        ? { levelLabel: viewerLevelLabel }
        : {}),
      ...(viewerIsPremium !== undefined
        ? { isPremium: viewerIsPremium }
        : {}),
      ...(viewerNotificationCount !== undefined
        ? { notificationCount: viewerNotificationCount }
        : {}),
      ...(viewerMessageCount !== undefined
        ? { messageCount: viewerMessageCount }
        : {}),
      ...(viewerFriendRequestCount !== undefined
        ? { friendRequestCount: viewerFriendRequestCount }
        : {}),
    }
  }, [
    hasViewer,
    viewerAvatarUrl,
    viewerFriendRequestCount,
    viewerInitials,
    viewerIsPremium,
    viewerLevelLabel,
    viewerMessageCount,
    viewerName,
    viewerNotificationCount,
    viewerStreak,
  ])

  useEffect(() => {
    if (!shell) {
      return
    }

    shell.setViewer(stableViewer)

    return () => {
      shell.setViewer(null)
    }
  }, [shell, stableViewer])

  if (shell) {
    return <>{children}</>
  }

  return (
    <AppShell viewer={viewer} {...standaloneProps}>
      {children}
    </AppShell>
  )
}