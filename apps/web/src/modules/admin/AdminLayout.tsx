import { Activity, BarChart3, Bell, BookOpenCheck, CircleHelp, ClipboardCheck, FileBarChart, Gauge, HeartPulse, LogOut, Menu, Megaphone, Settings, ShieldCheck, TicketCheck, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import ImminiqWordmark from '../../components/ui/ImminiqWordmark'
import { useAuthStore } from '../../store/useAuthStore'
import api from '../../lib/axios'
import './admin-theme.css'

const links = [
  { to: '/admin', label: 'Dashboard', icon: Gauge, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/trackers', label: 'Trackers', icon: BookOpenCheck },
  { to: '/admin/mock-tests', label: 'Mock Tests', icon: ClipboardCheck },
  { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/broadcast', label: 'Broadcast', icon: Megaphone },
  { to: '/admin/subscriptions', label: 'Premium / Subscriptions', icon: ShieldCheck },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: Activity },
  { to: '/admin/system-health', label: 'System Health', icon: HeartPulse },
  { to: '/admin/support-tickets', label: 'Support Tickets', icon: TicketCheck },
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.add('admin-dark')
    return () => document.documentElement.classList.remove('admin-dark')
  }, [])

  const logout = async () => {
    try { await api.post('/auth/logout') } catch { /* Local sign-out still completes. */ }
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-theme min-h-screen bg-[#070a11] text-[#e5edf8]">
      {open && <button className="fixed inset-0 z-30 bg-black/60 lg:hidden" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col border-r border-[#26344d] bg-[#0c111c] transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[86px] items-center justify-between px-8">
          <div className="flex items-center gap-3"><ImminiqWordmark /><span className="rounded border border-[#334155] px-1.5 py-0.5 text-[9px] font-bold text-[#67e8f9]">ADMIN</span></div>
          <button className="lg:hidden" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <nav className="mt-5 space-y-1 px-3">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={label} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-4 rounded-md px-5 py-3.5 text-[14px] font-semibold transition ${isActive ? 'bg-[#172033] text-[#67e8f9]' : 'text-[#94a3b8] hover:bg-[#172033]'}`}>
              <Icon size={20} strokeWidth={1.8} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-[#26344d] p-3">
          <NavLink to="/admin/settings" className="flex w-full items-center gap-4 rounded-md px-5 py-3 text-sm text-[#94a3b8] hover:bg-[#172033]"><Settings size={18} />Settings</NavLink>
          <NavLink to="/admin/support" className="flex w-full items-center gap-4 rounded-md px-5 py-3 text-sm text-[#94a3b8] hover:bg-[#172033]"><CircleHelp size={18} />Support</NavLink>
          <button className="flex w-full items-center gap-4 rounded-md px-5 py-3 text-sm text-[#94a3b8] hover:bg-[#172033]" onClick={() => void logout()}><LogOut size={18} />Sign out</button>
        </div>
      </aside>
      <div className="lg:pl-[252px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-[#26344d] bg-[#0a0f18]/95 px-4 backdrop-blur sm:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={22} /></button>
          <div className="hidden items-center gap-2 text-sm font-semibold lg:flex"><ShieldCheck size={17} className="text-[#67e8f9]" />Admin console</div>
          <div className="flex items-center gap-5"><Bell size={19} className="text-[#94a3b8]" /><div className="text-right"><div className="text-xs font-bold">{user?.fullName || user?.username}</div><div className="text-[9px] uppercase tracking-widest text-[#94a3b8]">{user?.role}</div></div><div className="grid h-9 w-9 place-items-center rounded-full bg-[#34d399] text-xs font-bold text-white">{(user?.fullName || user?.username || 'A').slice(0, 2).toUpperCase()}</div></div>
        </header>
        <Outlet />
      </div>
    </div>
  )
}
