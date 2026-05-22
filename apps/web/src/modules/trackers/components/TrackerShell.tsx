import { useState } from 'react'
import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'
import { cn } from '../utils/tracker-ui'

interface TrackerShellProps {
  children: React.ReactNode
  className?: string
}

export default function TrackerShell({ children, className }: TrackerShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#f5ede4] font-['DM_Sans',sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <Sidebar
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onCloseMobile={() => setMobileOpen(false)}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
      />
      <div className="min-h-screen lg:pl-56">
        <TopBar />
        <main className="min-h-[calc(100vh-54px)]">
          <div className={cn('mx-auto flex w-[min(1280px,calc(100%-32px))] flex-col gap-5 py-5 pb-24 max-[640px]:w-[calc(100%-20px)]', className)}>
            {children}
          </div>
          <AppFooter />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}