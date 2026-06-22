import { useState } from 'react'
import type { ReactNode } from 'react'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'
import { useAuthStore } from '../../auth/store/useAuthStore'
import { formatLevelLabel, getInitials } from '../utils/community-formatters'
import { cn } from '../utils/community-ui'
import CommunityNoiseOverlay from './CommunityNoiseOverlay'

interface CommunityLayoutProps {
  children: ReactNode
  loadingLabel?: string
}

export default function CommunityLayout({
  children,
  loadingLabel,
}: CommunityLayoutProps) {
  const user = useAuthStore((state) => state.user)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem('imminiq_sb') === 'closed',
  )

  const userName = user?.fullName || user?.username || 'Imminiq Scholar'

  return (
    <div
      className="relative min-h-screen overflow-x-clip bg-[#f5ede4] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]"
      role={loadingLabel ? 'status' : undefined}
      aria-label={loadingLabel}
    >
      <CommunityNoiseOverlay />

      <div className="relative z-1 flex min-h-screen w-full overflow-x-clip">
        <Sidebar
          mobileOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCloseMobile={() => setSidebarOpen(false)}
          onToggleCollapsed={() =>
            setSidebarCollapsed((value) => {
              const next = !value
              localStorage.setItem('imminiq_sb', next ? 'closed' : 'open')
              return next
            })
          }
        />

        <main
          className={cn(
            'flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300',
            sidebarCollapsed ? 'min-[901px]:ml-0' : 'min-[901px]:ml-56',
          )}
        >
          <TopBar
            onMenuClick={() => setSidebarOpen(true)}
            streakDays={0}
            userName={userName}
            userInitials={getInitials(userName)}
            userAvatarUrl={user?.avatarUrl || undefined}
            userLevel={formatLevelLabel(user?.isPremium)}
            isGuest={false}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            {children}
            <AppFooter />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
