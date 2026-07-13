import { cn } from '../../lib/cn'

import { Link, NavLink, useLocation } from 'react-router-dom'

import { prefetchRoute } from '../../lib/route-prefetch'
import ImminiqLogo from '../ui/ImminiqLogo'
import ImminiqWordmark from '../ui/ImminiqWordmark'

interface ISidebarProps {
  mobileOpen: boolean
  collapsed: boolean
  onCloseMobile: () => void
  onToggleCollapsed: () => void
}

const mainItems = [
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
]

const discoverItems = [
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
]

const intelligenceItems = [
  {
    label: 'Adaptive Learning',
    to: '/learning-agent',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2l1.4 5.1L18 9l-4.6 1.9L12 16l-1.4-5.1L6 9l4.6-1.9L12 2Z" />
        <path d="M5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z" />
        <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" />
      </svg>
    ),
  },
]

const personalItems = [
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
}: ISidebarProps) {
  const location = useLocation()

  const isInsideSettings =
    location.pathname === '/settings' ||
    location.pathname.startsWith('/settings/')

  const currentPathWithSearchAndHash = `${location.pathname}${location.search}${location.hash}`

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "mb-px flex items-center justify-between rounded-[var(--radius-sm)] px-2.5 py-[9px] font-ui text-[13px] font-medium tracking-normal no-underline transition",
      isActive
        ? 'bg-[rgba(184,76,43,0.10)] text-[var(--brand-500)] dark:bg-[rgba(232,129,106,0.12)] dark:text-[var(--brand-500)]'
        : 'text-[var(--text-secondary)] hover:bg-[rgba(184,76,43,0.06)] hover:text-[var(--brand-500)] dark:text-[var(--text-secondary)] dark:hover:bg-[rgba(232,129,106,0.08)] dark:hover:text-[var(--brand-500)]'
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
          "fixed bottom-0 left-0 top-0 z-30 flex w-56 flex-col border-r border-(--border-subtle) bg-(--surface-card) font-ui tracking-normal shadow-[0_16px_56px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-in-out dark:border-(--border-subtle) dark:bg-(--surface-card) min-[901px]:shadow-none",
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
          className="flex items-center gap-2.5 border-b border-(--border-subtle) px-5 pb-3.5 pt-4.5 no-underline dark:border-(--border-subtle)"
        >
          <ImminiqLogo size={34} className="rounded-md" decorative />

          <ImminiqWordmark className="font-ui text-[22px] font-extrabold leading-none tracking-[-0.5px]" />
        </Link>

        <nav className="flex-1 overflow-y-auto px-2.5 py-3.5">
          <div className="px-2.5 pb-1.25 pt-2.5 font-mono text-[8.5px] uppercase tracking-[0.15em] text-(--text-secondary) opacity-45 dark:text-(--text-secondary)">
            Main
          </div>

          {mainItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onCloseMobile}
              onMouseEnter={() => prefetchRoute(item.to)}
              onFocus={() => prefetchRoute(item.to)}
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
                        "rounded px-1.25 py-0.5 font-mono text-[9px]",
                        isActive
                          ? 'bg-[rgba(184,76,43,0.14)] text-(--brand-500) dark:bg-[rgba(232,129,106,0.16)] dark:text-(--brand-500)'
                          : 'bg-[rgba(26,23,20,0.09)] text-(--text-secondary) opacity-60 dark:bg-[rgba(242,240,235,0.09)] dark:text-(--text-secondary)'
                      )}
                    >
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          ))}

          <div className="px-2.5 pb-1.25 pt-4.5 font-mono text-[8.5px] uppercase tracking-[0.15em] text-(--text-secondary) opacity-45 dark:text-(--text-secondary)">
            Intelligence
          </div>

          {intelligenceItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onCloseMobile}
              onMouseEnter={() => prefetchRoute(item.to)}
              onFocus={() => prefetchRoute(item.to)}
              className={navLinkClass}
            >
              <span className="flex items-center gap-2.5">
                {item.icon}
                {item.label}
              </span>
            </NavLink>
          ))}

          <div className="px-2.5 pb-1.25 pt-4.5 font-mono text-[8.5px] uppercase tracking-[0.15em] text-(--text-secondary) opacity-45 dark:text-(--text-secondary)">
            Discover
          </div>

          {discoverItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onCloseMobile}
              onMouseEnter={() => prefetchRoute(item.to)}
              onFocus={() => prefetchRoute(item.to)}
              className={navLinkClass}
            >
              <span className="flex items-center gap-2.5">
                {item.icon}
                {item.label}
              </span>
            </NavLink>
          ))}

          <div className="px-2.5 pb-1.25 pt-4.5 font-mono text-[8.5px] uppercase tracking-[0.15em] text-(--text-secondary) opacity-45 dark:text-(--text-secondary)">
            Personal
          </div>

          {personalItems.map((item) => {
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
                onMouseEnter={() => prefetchRoute(target)}
                onFocus={() => prefetchRoute(target)}
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

        <div className="relative mx-2.5 mb-4 overflow-hidden rounded-md border border-[rgba(184,76,43,0.14)] bg-[rgba(184,76,43,0.07)] p-3.5 dark:border-[rgba(232,129,106,0.16)] dark:bg-[rgba(232,129,106,0.07)]">
          <span className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full bg-(--brand-500) opacity-[0.06] dark:bg-(--brand-500)" />

          <div className="relative z-1 mb-0.75 text-[12px] font-bold tracking-normal text-(--brand-500) dark:text-(--brand-500)">
            Upgrade to Pro
          </div>

          <p className="relative z-1 mb-2.5 text-[11px] leading-[1.45] tracking-normal text-(--text-secondary) dark:text-(--text-secondary)">
            Unlock advanced insights, AI evaluations, and unlimited tracker
            sharing.
          </p>

          <Link
            to="/pricing"
            onClick={onCloseMobile}
            className="relative z-1 block w-full rounded-lg border-none bg-(--brand-500) p-2.25 text-center font-ui text-[12px] font-bold tracking-normal text-[#fdf8f5] no-underline transition hover:bg-(--brand-600) dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
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
          'fixed top-1/2 z-31 hidden h-16 w-7 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-(--border-subtle) bg-(--surface-card) text-(--brand-500) shadow-[3px_0_16px_rgba(26,23,20,0.10)] transition-[left,width,background] duration-300 hover:w-8.5 hover:bg-[rgba(184,76,43,0.08)] dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--brand-500) dark:hover:bg-[rgba(232,129,106,0.10)] min-[901px]:flex',
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
