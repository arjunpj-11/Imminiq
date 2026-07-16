import {
  Activity,
  BarChart3,
  Bell,
  BookOpenCheck,
  ClipboardCheck,
  Gauge,
  HeartPulse,
  Cpu,
  LogOut,
  Menu,
  Megaphone,
  Settings,
  ShieldCheck,
  TicketCheck,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../../../components/overlays/ConfirmDialog';
import ImminiqWordmark from '../../../../components/ui/ImminiqWordmark';
import { useAuthStore } from '../../../../store/useAuthStore';
import api from '../../../../lib/axios';
import { getTemporaryAdminNavItem } from '../../../../lib/current-page-navigation';
import { refreshCurrentRoute } from '../../../../lib/refresh-current-route';
import { useAppShellStore } from '../../../../store/useAppShellStore';
import { ADMIN_ROUTES, ROUTES } from '../../../../routes/config/route-paths';
import { AUTH_API_PATHS } from '../../../auth';

const links = [
  { to: ADMIN_ROUTES.dashboard, label: 'Dashboard', icon: Gauge, end: true, moderator: true },
  { to: ADMIN_ROUTES.users, label: 'Users', icon: Users, moderator: false },
  { to: ADMIN_ROUTES.trackers, label: 'Trackers', icon: BookOpenCheck, moderator: true },
  { to: ADMIN_ROUTES.mockTests, label: 'Mock Tests', icon: ClipboardCheck, moderator: true },
  { to: ADMIN_ROUTES.activity, label: 'Activity', icon: BarChart3, moderator: false },
  { to: ADMIN_ROUTES.broadcast, label: 'Broadcast', icon: Megaphone, moderator: false },
  { to: ADMIN_ROUTES.subscriptions, label: 'Premium / Subscriptions', icon: ShieldCheck, moderator: false },
  { to: ADMIN_ROUTES.auditLogs, label: 'Audit Logs', icon: Activity, moderator: false },
  { to: ADMIN_ROUTES.systemHealth, label: 'System Health', icon: HeartPulse, moderator: false },
  { to: ADMIN_ROUTES.aiTokenSpend, label: 'AI Token Spend', icon: Cpu, moderator: false },
  { to: ADMIN_ROUTES.supportTickets, label: 'Support Tickets', icon: TicketCheck, moderator: true },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const routeRefreshVersion = useAppShellStore((state) => state.routeRefreshVersion);
  const temporaryItem = getTemporaryAdminNavItem(location.pathname, location.search, location.hash);

  useEffect(() => {
    document.documentElement.classList.add('admin-dark');
    return () => document.documentElement.classList.remove('admin-dark');
  }, []);

  const logout = async () => {
    try {
      await api.post(AUTH_API_PATHS.logout);
    } catch {
      /* Local sign-out still completes. */
    }
    clearAuth();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <div className="admin-theme min-h-screen bg-[#141412] text-[#f2f0eb]">
      {open && (
        <button
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-63 flex-col border-r border-[rgba(255,255,255,0.09)] bg-[#18100e] transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-21.5 items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <ImminiqWordmark />
            <span className="rounded border border-[rgba(255,255,255,0.16)] px-1.5 py-0.5 text-[9px] font-bold text-[#e8816a]">
              ADMIN
            </span>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="mt-5 space-y-1 px-3">
          {links
            .filter((item) => user?.role !== 'moderator' || item.moderator)
            .map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              onDoubleClick={refreshCurrentRoute}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-md px-5 py-3.5 text-[14px] font-semibold transition ${isActive ? 'bg-[rgba(232,129,106,0.15)] text-[#e8816a]' : 'text-[#aaa59d] hover:bg-[#24211e]'}`
              }
            >
              <Icon size={20} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
          {temporaryItem && (
            <NavLink
              to={temporaryItem.to}
              end
              onClick={() => setOpen(false)}
              onDoubleClick={refreshCurrentRoute}
              className="flex items-center gap-4 rounded-md bg-[rgba(232,129,106,0.15)] px-5 py-3.5 text-[14px] font-semibold text-[#e8816a] transition"
              aria-label={`${temporaryItem.label}. Double-click to refresh this page.`}
            >
              <Activity size={20} strokeWidth={1.8} />
              <span className="truncate">{temporaryItem.label}</span>
            </NavLink>
          )}
        </nav>
        <div className="mt-auto border-t border-[rgba(255,255,255,0.09)] p-3">
          {user?.role !== 'moderator' && (
            <NavLink
              to={ADMIN_ROUTES.settings}
              onDoubleClick={refreshCurrentRoute}
              className="flex w-full items-center gap-4 rounded-md px-5 py-3 text-sm text-[#aaa59d] hover:bg-[#2a2723]"
            >
              <Settings size={18} />
              Settings
            </NavLink>
          )}
          <button
            className="flex w-full items-center gap-4 rounded-md px-5 py-3 text-sm text-[#aaa59d] hover:bg-[#2a2723]"
            onClick={() => setSignOutConfirmOpen(true)}
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="lg:pl-63">
        <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-[rgba(255,255,255,0.09)] bg-[#1c1a18]/95 px-4 backdrop-blur sm:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu size={22} />
          </button>
          <div className="hidden items-center gap-2 text-sm font-semibold lg:flex">
            <ShieldCheck size={17} className="text-[#e8816a]" />
            Admin console
          </div>
          <div className="flex items-center gap-5">
            <Bell size={19} className="text-[#aaa59d]" />
            <div className="text-right">
              <div className="text-xs font-bold">{user?.fullName || user?.username}</div>
              <div className="text-[9px] uppercase tracking-widest text-[#aaa59d]">
                {user?.role}
              </div>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#52c58c] text-xs font-bold text-white">
              {(user?.fullName || user?.username || 'A').slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>
        <div key={routeRefreshVersion} className="contents">
          <Outlet />
        </div>
      </div>
      <ConfirmDialog
        open={signOutConfirmOpen}
        title="Sign out of the admin console?"
        description="Are you sure you want to sign out? You’ll need to sign in again to continue."
        confirmText="Sign out"
        onClose={() => setSignOutConfirmOpen(false)}
        onConfirm={() => void logout()}
      />
    </div>
  );
}
