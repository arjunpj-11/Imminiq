const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

interface BottomNavProps {
  /**
   * Kept optional for compatibility with older page calls.
   * This mobile nav intentionally renders all items inactive.
   */
  activeTab?: 'home' | 'trackers' | 'tests' | 'ranks' | 'community' | 'profile'
}

const tabs = [
  {
    key: 'home',
    label: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    key: 'trackers',
    label: 'Trackers',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    key: 'tests',
    label: 'Tests',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    key: 'ranks',
    label: 'Ranks',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    key: 'community',
    label: 'Community',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
] as const

export default function BottomNav({ activeTab: _activeTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 w-full max-w-full overflow-x-hidden border-t border-[#e0d0c5] bg-[rgba(253,248,245,0.97)] backdrop-blur-[20px] pb-[env(safe-area-inset-bottom,0px)] dark:border-white/[0.09] dark:bg-[rgba(26,24,22,0.97)] lg:hidden">
      <div className="grid h-14 w-full grid-cols-5 items-stretch">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={cn(
              'relative flex min-w-0 flex-col items-center justify-center gap-[3px] overflow-hidden bg-transparent px-1 text-[9px] font-["DM_Mono",monospace] tracking-[0.03em] text-[#6b5f58] transition-colors dark:text-[#9b9a92]',
              'border-none',
            )}
          >
            {tab.icon}
            <span className="max-w-full truncate">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
