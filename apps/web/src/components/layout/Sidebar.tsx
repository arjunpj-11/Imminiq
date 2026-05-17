import { Link, NavLink, useLocation } from 'react-router-dom'

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

interface SidebarProps {
  mobileOpen: boolean
  collapsed: boolean
  onCloseMobile: () => void
  onToggleCollapsed: () => void
}

const LogoIcon = () => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0 rounded-[10px]"
  >
    <rect x="10" y="10" width="80" height="80" rx="18" fill="#050505" />
    <g transform="translate(-5,1)">
      <rect x="31" y="35" width="9" height="34" rx="4.5" fill="#fff8ed" />
      <circle cx="35.5" cy="28.5" r="5.3" fill="#f15a35" />
      <path
        d="M64 32.8C73.8 34.7 79.5 42.2 79.5 51.5 79.5 61.8 71.2 68 60.2 68c-7 0-12-2.5-15.1-7.2"
        fill="none"
        stroke="#fff8ed"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <line
        x1="63.8"
        y1="55.5"
        x2="75.8"
        y2="67.5"
        stroke="#f15a35"
        strokeWidth="9"
        strokeLinecap="round"
      />
    </g>
  </svg>
)

const navItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Trackers',
    to: '/trackers',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: 'Mock Tests',
    to: '/mock-tests',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    label: 'Leaderboard',
    to: '/leaderboard',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: 'Community',
    to: '/community',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
]

const activityItems = [
  {
    label: 'Activity',
    to: '/activity',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    to: '/settings/security',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
      </svg>
    ),
  },
]

export default function Sidebar({
  mobileOpen,
  collapsed,
  onCloseMobile,
  onToggleCollapsed,
}: SidebarProps) {
  const location = useLocation()

  const isInsideSettings =
    location.pathname === '/settings' ||
    location.pathname.startsWith('/settings/')

  const currentPathWithSearchAndHash = `${location.pathname}${location.search}${location.hash}`

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "mb-px flex items-center justify-between rounded-[9px] px-2.5 py-[9px] font-['DM_Sans',sans-serif] text-[13px] font-medium tracking-normal no-underline transition",
      isActive
        ? 'bg-[rgba(184,76,43,0.10)] text-[#b84c2b] dark:bg-[rgba(232,129,106,0.12)] dark:text-[#e8816a]'
        : 'text-[#6b5f58] hover:bg-[rgba(184,76,43,0.06)] hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:bg-[rgba(232,129,106,0.08)] dark:hover:text-[#e8816a]'
    )

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-29 bg-[rgba(26,23,20,0.55)] opacity-0 backdrop-blur-sm transition-opacity duration-300 dark:bg-[rgba(0,0,0,0.70)] min-[901px]:hidden',
          mobileOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none'
        )}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed bottom-0 left-0 top-0 z-30 flex w-56 flex-col border-r border-[#e0d0c5] bg-[#fdf8f5] font-['DM_Sans',sans-serif] tracking-normal shadow-[0_16px_56px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-in-out dark:border-white/9 dark:bg-[#1a1816] min-[901px]:shadow-none",
          mobileOpen
            ? 'max-[900px]:translate-x-0'
            : 'max-[900px]:-translate-x-full',
          collapsed
            ? 'min-[901px]:-translate-x-56'
            : 'min-[901px]:translate-x-0'
        )}
      >
        <Link
          to="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 border-b border-[#e0d0c5] px-5 pb-3.5 pt-4.5 no-underline dark:border-white/9"
        >
          <LogoIcon />

          <span className="font-['Playfair_Display',serif] text-[22px] font-extrabold leading-none tracking-[-0.5px] text-[#b84c2b] dark:text-[#e8816a]">
            Imminiq
          </span>
        </Link>

        <nav className="flex-1 overflow-y-auto px-2.5 py-3.5">
          <div className="px-2.5 pb-1.25 pt-2.5 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.15em] text-[#6b5f58] opacity-45 dark:text-[#9b9a92]">
            Main
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onCloseMobile}
              className={navLinkClass}
            >
              {({ isActive }) => (
                <>
                  <span className="flex items-center gap-2.5">
                    {item.icon}
                    {item.label}
                  </span>

                  {'kbd' in item && item.kbd ? (
                    <span
                      className={cn(
                        "rounded px-1.25 py-0.5 font-['DM_Mono',monospace] text-[9px]",
                        isActive
                          ? 'bg-[rgba(184,76,43,0.14)] text-[#b84c2b] dark:bg-[rgba(232,129,106,0.16)] dark:text-[#e8816a]'
                          : 'bg-[rgba(26,23,20,0.09)] text-[#6b5f58] opacity-60 dark:bg-[rgba(242,240,235,0.09)] dark:text-[#9b9a92]'
                      )}
                    >
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          ))}

          <div className="px-2.5 pb-1.25 pt-4.5 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.15em] text-[#6b5f58] opacity-45 dark:text-[#9b9a92]">
            Personal
          </div>

          {activityItems.map((item) => {
            const isSettingsItem = item.label === 'Settings'

            const target =
              isSettingsItem && isInsideSettings
                ? currentPathWithSearchAndHash
                : item.to

            return (
              <NavLink
                key={item.label}
                to={target}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  navLinkClass({
                    isActive: isSettingsItem ? isInsideSettings : isActive,
                  })
                }
              >
                <span className="flex items-center gap-2.5">
                  {item.icon}
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </nav>

        <div className="relative mx-2.5 mb-4 overflow-hidden rounded-[14px] border border-[rgba(184,76,43,0.14)] bg-[rgba(184,76,43,0.07)] p-3.5 dark:border-[rgba(232,129,106,0.16)] dark:bg-[rgba(232,129,106,0.07)]">
          <span className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full bg-[#b84c2b] opacity-[0.06] dark:bg-[#e8816a]" />

          <div className="relative z-1 mb-0.75 text-[12px] font-bold tracking-normal text-[#b84c2b] dark:text-[#e8816a]">
            Upgrade to Pro
          </div>

          <p className="relative z-1 mb-2.5 text-[11px] leading-[1.45] tracking-normal text-[#6b5f58] dark:text-[#9b9a92]">
            Unlock advanced insights, AI evaluations, and unlimited tracker
            sharing.
          </p>

          <Link
            to="/pricing"
            onClick={onCloseMobile}
            className="relative z-1 block w-full rounded-lg border-none bg-[#b84c2b] p-2.25 text-center font-['DM_Sans',sans-serif] text-[12px] font-bold tracking-normal text-[#fdf8f5] no-underline transition hover:bg-[#963d22] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
          >
            Upgrade
          </Link>
        </div>
      </aside>

      <button
        type="button"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={onToggleCollapsed}
        className={cn(
          'fixed top-1/2 z-31 hidden h-16 w-7 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-[#e0d0c5] bg-[#fdf8f5] text-[#b84c2b] shadow-[3px_0_16px_rgba(26,23,20,0.10)] transition-[left,width,background] duration-300 hover:w-8.5 hover:bg-[rgba(184,76,43,0.08)] dark:border-white/9 dark:bg-[#1a1816] dark:text-[#e8816a] dark:hover:bg-[rgba(232,129,106,0.10)] min-[901px]:flex',
          collapsed ? 'left-0' : 'left-56'
        )}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={cn(
            'transition-transform duration-300',
            collapsed && 'rotate-180'
          )}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </>
  )
}