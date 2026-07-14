import { NavLink, useLocation } from 'react-router-dom';

import { cn } from '../../lib/cn';
import { prefetchRoute } from '../../lib/route-prefetch';
import { getTemporaryUserNavItem } from '../../lib/current-page-navigation';
import { refreshCurrentRoute } from '../../lib/refresh-current-route';

interface IBottomNavProps {
  activeTab?: 'home' | 'trackers' | 'tests' | 'adaptive' | 'ranks' | 'community' | 'profile';
}

const tabs = [
  {
    key: 'home',
    label: 'Home',
    to: '/dashboard',
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </>
    ),
  },
  {
    key: 'trackers',
    label: 'Trackers',
    to: '/trackers',
    icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  },
  {
    key: 'tests',
    label: 'Tests',
    to: '/mock-tests',
    icon: (
      <>
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </>
    ),
  },
  {
    key: 'adaptive',
    label: 'Adaptive',
    to: '/learning-agent',
    icon: (
      <>
        <path d="M12 2l1.4 5.1L18 9l-4.6 1.9L12 16l-1.4-5.1L6 9l4.6-1.9L12 2Z" />
        <path d="M5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z" />
      </>
    ),
  },
  {
    key: 'ranks',
    label: 'Ranks',
    to: '/leaderboard',
    icon: (
      <>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </>
    ),
  },
  {
    key: 'community',
    label: 'Community',
    to: '/community',
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </>
    ),
  },
] as const;

export default function BottomNav({ activeTab: _activeTab }: IBottomNavProps) {
  const location = useLocation();
  const temporaryItem = getTemporaryUserNavItem(
    location.pathname,
    location.search,
    location.hash
  );
  const visibleTabs = temporaryItem
    ? [
        ...tabs,
        {
          key: 'current',
          label: temporaryItem.label,
          to: temporaryItem.to,
          icon: (
            <>
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 3v6h6" />
            </>
          ),
        },
      ]
    : tabs;

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 w-full border-t border-(--border-subtle) bg-[color-mix(in_srgb,var(--surface-elevated)_94%,transparent)] pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl lg:hidden"
    >
      <div
        className="grid h-16 w-full items-stretch"
        style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))` }}
      >
        {visibleTabs.map((tab) => (
          <NavLink
            key={tab.key}
            to={tab.to}
            end={tab.to === '/dashboard'}
            onDoubleClick={refreshCurrentRoute}
            onMouseEnter={() => prefetchRoute(tab.to)}
            onFocus={() => prefetchRoute(tab.to)}
            className={({ isActive }) =>
              cn(
                'relative flex min-w-0 flex-col items-center justify-center gap-1 overflow-hidden px-1 font-mono text-[9px] font-semibold no-underline transition-colors',
                isActive ? 'text-(--brand-500)' : 'text-(--text-muted) hover:text-(--text-primary)'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-(--brand-500)" />
                )}
                <span
                  className={cn(
                    'flex h-7 w-8 items-center justify-center rounded-sm transition',
                    isActive && 'bg-[color-mix(in_srgb,var(--brand-500)_10%,transparent)]'
                  )}
                >
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    {tab.icon}
                  </svg>
                </span>
                <span className="max-w-full truncate">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
