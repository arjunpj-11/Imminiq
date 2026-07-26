import {
  Activity,
  BarChart3,
  BookOpenCheck,
  ChevronLeft,
  ClipboardCheck,
  Cpu,
  FileQuestion,
  Flag,
  Gauge,
  Globe2,
  HeartPulse,
  LogOut,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  Scale,
  TicketCheck,
  Users,
} from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import ConfirmDialog from './AdminConfirmDialog';
import ImminiqLogo from '../ui/ImminiqLogo';
import ImminiqWordmark from '../ui/ImminiqWordmark';
import { getTemporaryAdminNavItem } from '../../lib/current-page-navigation';
import { refreshCurrentRoute } from '../../lib/refresh-current-route';
import { ADMIN_ROUTES } from '../../routes/config/route-paths';
import { ADMIN_ROUTE_ROLES, canAccessAdminRoute } from '../../routes/config/admin-access';
import { useAppShellStore } from '../../store/useAppShellStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useLogout } from '../../modules/auth';
import './admin-theme.css';
import { RouteSkeleton } from '../feedback/RouteSkeleton';

const SIDEBAR_STORAGE_KEY = 'imminiq.admin.sidebar.collapsed';

const links = [
  {
    to: ADMIN_ROUTES.dashboard,
    label: 'Dashboard',
    section: 'Overview',
    icon: Gauge,
    end: true,
    roles: ADMIN_ROUTE_ROLES.dashboard,
  },
  {
    to: ADMIN_ROUTES.users,
    label: 'Users',
    section: 'People',
    icon: Users,
    roles: ADMIN_ROUTE_ROLES.users,
    end: true,
  },
  {
    to: ADMIN_ROUTES.userAppeals,
    label: 'Account Appeals',
    section: 'People',
    icon: Scale,
    roles: ADMIN_ROUTE_ROLES.users,
  },
  {
    to: ADMIN_ROUTES.trackers,
    label: 'Trackers',
    section: 'Content',
    icon: BookOpenCheck,
    roles: ADMIN_ROUTE_ROLES.trackers,
    end: true,
  },
  {
    to: ADMIN_ROUTES.trackerReports,
    label: 'Tracker Report Queue',
    section: 'Content',
    icon: Flag,
    roles: ADMIN_ROUTE_ROLES.trackers,
  },
  {
    to: ADMIN_ROUTES.trackerReviews,
    label: 'Verification Queue',
    section: 'Content',
    icon: ShieldCheck,
    roles: ADMIN_ROUTE_ROLES.trackers,
  },
  {
    to: ADMIN_ROUTES.publishedTrackers,
    label: 'Published Trackers',
    section: 'Content',
    icon: Globe2,
    roles: ADMIN_ROUTE_ROLES.trackers,
  },
  {
    to: ADMIN_ROUTES.mockTests,
    label: 'Mock Tests',
    section: 'Content',
    icon: ClipboardCheck,
    roles: ADMIN_ROUTE_ROLES.mockTests,
    end: true,
  },
  {
    to: ADMIN_ROUTES.mockTestReports,
    label: 'Question Report Queue',
    section: 'Content',
    icon: Flag,
    roles: ADMIN_ROUTE_ROLES.mockTests,
  },
  {
    to: ADMIN_ROUTES.questionBank,
    label: 'Question Bank',
    section: 'Content',
    icon: FileQuestion,
    roles: ADMIN_ROUTE_ROLES.mockTests,
  },
  {
    to: ADMIN_ROUTES.activity,
    label: 'Activity',
    section: 'Insights',
    icon: BarChart3,
    roles: ADMIN_ROUTE_ROLES.analytics,
  },
  {
    to: ADMIN_ROUTES.broadcast,
    label: 'Broadcast',
    section: 'Engagement',
    icon: Megaphone,
    roles: ADMIN_ROUTE_ROLES.broadcast,
  },
  {
    to: ADMIN_ROUTES.subscriptions,
    label: 'Subscriptions',
    section: 'Business',
    icon: ShieldCheck,
    roles: ADMIN_ROUTE_ROLES.subscriptions,
  },
  {
    to: ADMIN_ROUTES.auditLogs,
    label: 'Audit Logs',
    section: 'Operations',
    icon: Activity,
    roles: ADMIN_ROUTE_ROLES.auditLogs,
  },
  {
    to: ADMIN_ROUTES.systemHealth,
    label: 'System Health',
    section: 'Operations',
    icon: HeartPulse,
    roles: ADMIN_ROUTE_ROLES.systemHealth,
  },
  {
    to: ADMIN_ROUTES.aiTokenSpend,
    label: 'AI Token Spend',
    section: 'Operations',
    icon: Cpu,
    roles: ADMIN_ROUTE_ROLES.aiTokenSpend,
  },
  {
    to: ADMIN_ROUTES.supportTickets,
    label: 'Support Tickets',
    section: 'Support',
    icon: TicketCheck,
    roles: ADMIN_ROUTE_ROLES.supportTickets,
  },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  });
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 1024px)').matches
  );
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const location = useLocation();
  const routeRefreshVersion = useAppShellStore((state) => state.routeRefreshVersion);
  const temporaryItem = getTemporaryAdminNavItem(location.pathname, location.search, location.hash);

  useEffect(() => {
    document.documentElement.classList.add('admin-dark');
    return () => document.documentElement.classList.remove('admin-dark');
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const syncViewport = () => {
      setIsDesktop(media.matches);
      if (media.matches) setMobileOpen(false);
    };

    syncViewport();
    media.addEventListener('change', syncViewport);
    return () => media.removeEventListener('change', syncViewport);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false); // eslint-disable-line react-hooks/set-state-in-effect
  }, [location.pathname, location.search, location.hash]);

  const toggleSidebar = () => {
    if (isDesktop) {
      setSidebarCollapsed((current) => !current);
      return;
    }
    setMobileOpen((current) => !current);
  };

  const displayName = user?.fullName || user?.username || 'Administrator';
  const showSidebarLabels = !isDesktop || !sidebarCollapsed;
  const sidebarToggleLabel = isDesktop
    ? sidebarCollapsed
      ? 'Expand admin sidebar'
      : 'Collapse admin sidebar'
    : mobileOpen
      ? 'Close admin navigation'
      : 'Open admin navigation';

  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    `admin-sidebar-link flex min-h-12 items-center rounded-lg py-3 text-[14px] font-semibold transition ${
      showSidebarLabels ? 'gap-4 px-5' : 'justify-center px-3'
    } ${
      isActive
        ? 'bg-[rgba(232,129,106,0.15)] text-[#e8816a]'
        : 'text-[#aaa59d] hover:bg-[#24211e] hover:text-[#f2f0eb]'
    }`;
  const visibleLinks = links.filter((item) => canAccessAdminRoute(item.roles, user?.role));
  const currentPageLabel =
    temporaryItem?.label ||
    visibleLinks
      .slice()
      .sort((a, b) => b.to.length - a.to.length)
      .find((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`))
      ?.label ||
    (location.pathname.startsWith(ADMIN_ROUTES.settings) ? 'Settings' : 'Admin console');

  return (
    <div className="admin-theme min-h-screen bg-[#141412] text-[#f2f0eb]">
      <a
        href="#admin-main-content"
        className="fixed left-4 top-4 z-70 -translate-y-24 rounded-lg bg-[#e8816a] px-4 py-2 font-bold text-[#1a1210] transition focus:translate-y-0"
      >
        Skip to admin content
      </a>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/65 backdrop-blur-[2px] lg:hidden"
          aria-label="Close admin navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        id="admin-navigation"
        aria-label="Admin navigation"
        className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[rgba(255,255,255,0.09)] bg-[#18100e] transition-[width,transform] duration-200 lg:translate-x-0 ${
          sidebarCollapsed ? 'lg:w-21' : 'lg:w-68'
        } w-68 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div
          className={`flex h-21.5 shrink-0 items-center border-b border-white/6 ${
            showSidebarLabels ? 'justify-between px-5' : 'justify-center px-3'
          }`}
        >
          {showSidebarLabels ? (
            <div className="flex min-w-0 items-center gap-3 overflow-hidden">
              <ImminiqLogo size={34} className="shrink-0 rounded-[10px]" decorative />
              <ImminiqWordmark />
              <span className="rounded border border-[rgba(255,255,255,0.16)] px-1.5 py-0.5 text-[9px] font-bold text-[#e8816a]">
                ADMIN
              </span>
            </div>
          ) : (
            <span
              className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8816a]/25 bg-[#e8816a]/10"
              title="Imminiq Admin"
            >
              <ImminiqLogo size={30} className="rounded-lg" decorative />
              <span className="sr-only">Imminiq Admin</span>
            </span>
          )}

          {!isDesktop && (
            <button
              type="button"
              className="admin-icon-button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close admin navigation"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="relative min-h-0 flex-1">
          <nav className="h-full space-y-1 overflow-y-auto px-3 pb-9 pt-5">
            {visibleLinks.map(({ to, label, section, icon: Icon, end }, index) => (
              <div key={label}>
                {showSidebarLabels && section !== visibleLinks[index - 1]?.section && (
                  <div
                    className={`px-5 pb-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#817c75] ${index === 0 ? 'pt-0' : 'pt-4'}`}
                  >
                    {section}
                  </div>
                )}
                <NavLink
                  to={to}
                  end={end}
                  title={!showSidebarLabels ? label : undefined}
                  onDoubleClick={refreshCurrentRoute}
                  className={linkClassName}
                >
                  <Icon className="shrink-0" size={20} strokeWidth={1.8} aria-hidden="true" />
                  {showSidebarLabels && <span className="truncate">{label}</span>}
                </NavLink>
              </div>
            ))}

            {temporaryItem && (
              <NavLink
                to={temporaryItem.to}
                end
                title={!showSidebarLabels ? temporaryItem.label : undefined}
                onDoubleClick={refreshCurrentRoute}
                className={`admin-sidebar-link flex min-h-12 items-center rounded-lg bg-[rgba(232,129,106,0.15)] py-3 text-[14px] font-semibold text-[#e8816a] transition ${
                  showSidebarLabels ? 'gap-4 px-5' : 'justify-center px-3'
                }`}
                aria-label={`${temporaryItem.label}. Double-click to refresh this page.`}
              >
                <Activity className="shrink-0" size={20} strokeWidth={1.8} aria-hidden="true" />
                {showSidebarLabels && <span className="truncate">{temporaryItem.label}</span>}
              </NavLink>
            )}
          </nav>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-[#18100e] to-transparent"
          />
        </div>

        <div className="shrink-0 border-t border-[rgba(255,255,255,0.09)] p-3">
          {canAccessAdminRoute(ADMIN_ROUTE_ROLES.settings, user?.role) && (
            <NavLink
              to={ADMIN_ROUTES.settings}
              title={!showSidebarLabels ? 'Settings' : undefined}
              onDoubleClick={refreshCurrentRoute}
              className={linkClassName}
            >
              <Settings className="shrink-0" size={18} aria-hidden="true" />
              {showSidebarLabels && <span>Settings</span>}
            </NavLink>
          )}
          <button
            type="button"
            title={!showSidebarLabels ? 'Sign out' : undefined}
            className={`admin-sidebar-link mt-1 flex min-h-12 w-full items-center rounded-lg py-3 text-sm text-[#aaa59d] transition hover:bg-[#2a2723] hover:text-[#f2f0eb] ${
              showSidebarLabels ? 'gap-4 px-5' : 'justify-center px-3'
            }`}
            onClick={() => setSignOutConfirmOpen(true)}
          >
            <LogOut className="shrink-0" size={18} aria-hidden="true" />
            {showSidebarLabels && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      <div
        className={`transition-[padding] duration-200 ${
          sidebarCollapsed ? 'lg:pl-21' : 'lg:pl-68'
        }`}
      >
        <header className="admin-shell-header sticky top-0 z-20 flex h-17 items-center justify-between border-b border-[rgba(255,255,255,0.09)] bg-[#1c1a18]/92 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="admin-icon-button"
              onClick={toggleSidebar}
              aria-controls="admin-navigation"
              aria-expanded={isDesktop ? !sidebarCollapsed : mobileOpen}
              aria-label={sidebarToggleLabel}
              title={sidebarToggleLabel}
            >
              {isDesktop && !sidebarCollapsed ? (
                <PanelLeftClose size={20} aria-hidden="true" />
              ) : (
                <PanelLeftOpen size={20} aria-hidden="true" />
              )}
            </button>

            <div className="hidden min-w-0 items-center gap-2 text-sm font-semibold sm:flex">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#e8816a]/10">
                <ImminiqLogo size={24} className="rounded-md" decorative />
              </span>
              <span className="truncate">Admin console</span>
            </div>
            <span className="min-w-0 truncate text-sm font-semibold sm:hidden">
              {currentPageLabel}
            </span>
          </div>

          <div className="ml-auto flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="hidden min-w-0 text-right sm:block">
              <div className="max-w-44 truncate text-xs font-bold">{displayName}</div>
              <div className="text-[9px] uppercase tracking-widest text-[#aaa59d]">
                {user?.role || 'admin'}
              </div>
            </div>
            <div
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-[#52c58c] text-xs font-bold text-white shadow-lg shadow-black/20"
              aria-label={`${displayName} profile`}
              title={displayName}
            >
              {displayName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <div id="admin-main-content" key={routeRefreshVersion} className="contents" tabIndex={-1}>
          <Suspense fallback={<RouteSkeleton />}>
            <Outlet />
          </Suspense>
        </div>
      </div>

      <ConfirmDialog
        open={signOutConfirmOpen}
        title="Sign out of the admin console?"
        description="Are you sure you want to sign out? You’ll need to sign in again to continue."
        confirmText="Sign out"
        onClose={() => setSignOutConfirmOpen(false)}
        isLoading={logout.isPending}
        onConfirm={() => logout.mutate()}
      />
    </div>
  );
}
