import { useState, type ReactNode } from 'react'
import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'
import SettingsTabs from './SettingsTabs'
import { cn } from '../utils/settingsUi.utils'

export default function SettingsShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem('imminiq_sb') === 'closed'
  )

  const handleToggleSidebarCollapsed = () => {
    setSidebarCollapsed((current) => {
      const next = !current

      if (typeof window !== 'undefined') {
        localStorage.setItem('imminiq_sb', next ? 'closed' : 'open')
      }

      return next
    })
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#f5ede4] font-['DM_Sans',sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <div className="flex min-h-screen w-full overflow-x-clip">
        <Sidebar
          mobileOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCloseMobile={() => setSidebarOpen(false)}
          onToggleCollapsed={handleToggleSidebarCollapsed}
        />

        <main
          className={cn(
            'flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300',
            sidebarCollapsed ? 'min-[901px]:ml-0' : 'min-[901px]:ml-56'
          )}
        >
          <TopBar onMenuClick={() => setSidebarOpen(true)} />

          <div className="flex min-w-0 flex-1 flex-col">
            <section className="px-4 pb-28 pt-6 sm:px-6 lg:px-8">
              <div className="mx-auto w-full max-w-295">
                <div className="mb-6">
                  <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.18em] text-[#b84c2b] dark:text-[#e8816a]">
                    Settings
                  </p>

                  <h1 className="mt-2 font-['Playfair_Display',serif] text-[34px] font-extrabold tracking-[-0.8px] text-[#1a1714] dark:text-[#f2f0eb]">
                    {title}
                  </h1>

                  <p className="mt-2 max-w-3xl text-[14px] leading-[1.7] text-[#6b5f58] dark:text-[#9b9a92]">
                    {subtitle}
                  </p>
                </div>

                <SettingsTabs />

                {children}
              </div>
            </section>

            <AppFooter />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
