import { useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';

import { useStreak } from '../../hooks/progress/useStreak';
import { useRealtimeAppEvents } from '../../hooks/useRealtimeAppEvents';
import { cn } from '../../lib/cn';
import { getTemporaryUserNavItem } from '../../lib/current-page-navigation';
import { useAppShellStore } from '../../store/useAppShellStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotifications } from '../../modules/notifications';
import { useReceivedFriendRequests } from '../../modules/user/friends';
import { useChatConversations } from '../../modules/user/social';
import { useFeatureAvailability } from '../../hooks/useFeatureAvailability';
import AppNoiseOverlay from './AppNoiseOverlay';
import {
  AppShellContext,
  type IAppShellContextValue,
  type IAppShellViewer,
} from './AppShellContext';
import AppFooter from './Footer';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export type { IAppShellViewer } from './AppShellContext';

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'IM';

interface IAppShellProps {
  children: ReactNode;
  viewer?: IAppShellViewer;
  showSidebar?: boolean;
  isGuest?: boolean;
  withTopBar?: boolean;
  withFooter?: boolean;
  className?: string;
}

export function AppShell({
  children,
  viewer: initialViewer,
  showSidebar = true,
  isGuest = false,
  withTopBar = true,
  withFooter = true,
  className,
}: IAppShellProps) {
  const authUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const location = useLocation();
  const featureQuery = useFeatureAvailability(!isGuest && isAuthenticated);

  const streakQuery = useStreak(undefined, {
    enabled: !isGuest && isAuthenticated && featureQuery.data?.activity === true,
  });
  const notificationsQuery = useNotifications(1, !isGuest && isAuthenticated);
  const friendRequestsQuery = useReceivedFriendRequests(
    { limit: 1 },
    !isGuest && isAuthenticated && featureQuery.data?.social === true
  );
  const chatQuery = useChatConversations(
    30,
    !isGuest && isAuthenticated && featureQuery.data?.social === true
  );
  useRealtimeAppEvents(accessToken, !isGuest && isAuthenticated);

  const [pageViewer, setPageViewer] = useState<IAppShellViewer | null>(initialViewer ?? null);

  const mobileSidebarOpen = useAppShellStore((state) => state.mobileSidebarOpen);

  const sidebarCollapsed = useAppShellStore((state) => state.sidebarCollapsed);

  const openMobileSidebar = useAppShellStore((state) => state.openMobileSidebar);

  const closeMobileSidebar = useAppShellStore((state) => state.closeMobileSidebar);

  const toggleSidebarCollapsed = useAppShellStore((state) => state.toggleSidebarCollapsed);

  const setSidebarCollapsed = useAppShellStore((state) => state.setSidebarCollapsed);

  const routeRefreshVersion = useAppShellStore((state) => state.routeRefreshVersion);

  const contextValue = useMemo<IAppShellContextValue>(
    () => ({
      setViewer: setPageViewer,
    }),
    []
  );

  const fallbackName =
    authUser?.fullName || authUser?.username || (isGuest ? 'Guest' : 'Imminiq User');

  const userName = pageViewer?.name || initialViewer?.name || fallbackName;

  const userAvatarUrl = pageViewer?.avatarUrl ?? initialViewer?.avatarUrl ?? authUser?.avatarUrl;

  const isPremium = pageViewer?.isPremium ?? initialViewer?.isPremium ?? authUser?.isPremium;

  const userLevel =
    pageViewer?.levelLabel ||
    initialViewer?.levelLabel ||
    (isPremium ? 'Imminiq Pro' : 'Free Scholar');

  useEffect(() => {
    const hasTemporaryNavItem = Boolean(getTemporaryUserNavItem(location.pathname));
    if (!hasTemporaryNavItem) return;

    closeMobileSidebar();
    setSidebarCollapsed(true);
  }, [closeMobileSidebar, location.pathname, setSidebarCollapsed]);

  return (
    <AppShellContext.Provider value={contextValue}>
      <div
        className={cn(
          'relative min-h-screen overflow-x-clip bg-(--surface-canvas) font-ui text-(--text-primary) dark:bg-(--surface-canvas) dark:text-(--text-primary)',
          className
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
              showSidebar && !sidebarCollapsed ? 'lg:ml-56' : 'lg:ml-0'
            )}
          >
            {withTopBar && (
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
                  pageViewer?.initials || initialViewer?.initials || getInitials(userName)
                }
                {...(userAvatarUrl ? { userAvatarUrl } : {})}
                userLevel={userLevel}
                isGuest={isGuest}
                notificationCount={
                  notificationsQuery.data?.unreadCount ??
                  pageViewer?.notificationCount ??
                  initialViewer?.notificationCount ??
                  0
                }
                messageCount={
                  chatQuery.data?.pages
                    .flatMap((page) => page.items)
                    .reduce((total, conversation) => total + conversation.unreadCount, 0) ??
                  pageViewer?.messageCount ??
                  initialViewer?.messageCount ??
                  0
                }
                friendRequestCount={
                  friendRequestsQuery.data?.pages[0]?.pendingReceivedCount ??
                  pageViewer?.friendRequestCount ??
                  initialViewer?.friendRequestCount ??
                  0
                }
              />
            )}

            <div className="flex min-w-0 flex-1 flex-col">
              <div key={routeRefreshVersion} className="contents">
                {children}
              </div>

              {withFooter && <AppFooter />}
            </div>
          </main>
        </div>
      </div>
    </AppShellContext.Provider>
  );
}

export function AppShellBoundary({ children, viewer, ...standaloneProps }: IAppShellProps) {
  const shell = useContext(AppShellContext);

  const viewerName = viewer?.name;
  const viewerInitials = viewer?.initials;
  const viewerAvatarUrl = viewer?.avatarUrl;
  const viewerStreak = viewer?.streak;
  const viewerLevelLabel = viewer?.levelLabel;
  const viewerIsPremium = viewer?.isPremium;
  const viewerNotificationCount = viewer?.notificationCount;
  const viewerMessageCount = viewer?.messageCount;
  const viewerFriendRequestCount = viewer?.friendRequestCount;
  const hasViewer = viewer !== undefined;

  const stableViewer = useMemo<IAppShellViewer | null>(() => {
    if (!hasViewer) {
      return null;
    }

    return {
      ...(viewerName !== undefined ? { name: viewerName } : {}),
      ...(viewerInitials !== undefined ? { initials: viewerInitials } : {}),
      ...(viewerAvatarUrl !== undefined ? { avatarUrl: viewerAvatarUrl } : {}),
      ...(viewerStreak !== undefined ? { streak: viewerStreak } : {}),
      ...(viewerLevelLabel !== undefined ? { levelLabel: viewerLevelLabel } : {}),
      ...(viewerIsPremium !== undefined ? { isPremium: viewerIsPremium } : {}),
      ...(viewerNotificationCount !== undefined
        ? { notificationCount: viewerNotificationCount }
        : {}),
      ...(viewerMessageCount !== undefined ? { messageCount: viewerMessageCount } : {}),
      ...(viewerFriendRequestCount !== undefined
        ? { friendRequestCount: viewerFriendRequestCount }
        : {}),
    };
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
  ]);

  useEffect(() => {
    if (!shell) {
      return;
    }

    shell.setViewer(stableViewer);

    return () => {
      shell.setViewer(null);
    };
  }, [shell, stableViewer]);

  if (shell) {
    return <>{children}</>;
  }

  return (
    <AppShell viewer={viewer} {...standaloneProps}>
      {children}
    </AppShell>
  );
}
