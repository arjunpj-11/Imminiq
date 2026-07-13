import { Activity, CheckCircle2, CircleUserRound, Radio, RefreshCw, ShieldBan, Target } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getAdminDashboard } from './admin-dashboard.api'

const number = new Intl.NumberFormat('en-US')

export default function AdminDashboardPage() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getAdminDashboard,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
  if (isLoading) return <div className="p-10 text-sm text-[#94a3b8]">Loading admin overview…</div>
  if (isError || !data) return <div className="p-10 text-sm text-rose-400">The admin overview could not be loaded.</div>

  const metrics = [
    ['Total users', data.metrics.totalUsers, CircleUserRound, '#67e8f9'],
    ['Active today', data.metrics.activeToday, Activity, '#34d399'],
    ['Total trackers', data.metrics.totalTrackers, Target, '#22d3ee'],
    ['Blocked users', data.metrics.blockedUsers, ShieldBan, '#fb7185'],
  ] as const
  const peak = Math.max(...data.weeklyActivity, 1)

  return <main className="mx-auto max-w-[1240px] px-5 py-9 sm:px-8">
    <div className="mb-9 flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#67e8f9]">Admin console <Radio size={12} className="text-emerald-400" /> Live data</div><h1 className="font-editorial text-4xl font-bold sm:text-5xl">Performance Overview</h1></div><div className="flex items-center gap-3"><div className="text-right font-mono text-xs text-[#94a3b8]">{new Date().toLocaleString()}</div><button type="button" onClick={() => void refetch()} disabled={isFetching} aria-label="Refresh dashboard data" className="grid h-9 w-9 place-items-center rounded-md border border-[#26344d] text-[#94a3b8] hover:bg-[#172033] hover:text-[#67e8f9] disabled:opacity-50"><RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} /></button></div></div>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, Icon, color]) => <div key={label} className="relative overflow-hidden rounded-xl border border-[#26344d] bg-[#111827] p-6"><span className="absolute inset-y-0 left-0 w-1" style={{ background: color }} /><div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#94a3b8]">{label}<Icon size={17} style={{ color }} /></div><div className="font-editorial mt-5 text-3xl font-bold">{number.format(value)}</div></div>)}</section>
    <section className="mt-7 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
      <div className="rounded-xl border border-[#26344d] bg-[#111827] p-6 sm:p-8"><div className="flex items-center justify-between"><h2 className="font-editorial text-2xl font-bold">Platform Activity</h2><span className="rounded-md bg-[#111827] px-3 py-1.5 text-xs">7D</span></div><div className="mt-9 flex h-64 items-end gap-3 border-b border-[#334155] px-2 sm:gap-6">{data.weeklyActivity.map((value, index) => <div key={index} className="flex h-full flex-1 flex-col justify-end"><div className="rounded-t-sm bg-[#334155] transition-all" style={{ height: `${Math.max(8, (value / peak) * 90)}%`, background: value === peak ? '#67e8f9' : undefined }} /><span className="pt-3 text-center text-[9px] text-[#94a3b8]">{['MON','TUE','WED','THU','FRI','SAT','SUN'][index]}</span></div>)}</div></div>
      <div className="rounded-xl border border-[#26344d] bg-[#111827] p-6 sm:p-8"><div className="mb-6 flex items-center justify-between"><h2 className="font-editorial text-2xl font-bold">User Health</h2><Link to="/admin/users" className="text-[10px] font-bold uppercase text-[#67e8f9]">View all</Link></div><div className="space-y-3">{data.metrics.blockedUsers === 0 ? <div className="rounded-lg bg-[#111827] p-5 text-sm"><CheckCircle2 className="mb-3 text-emerald-400" />No user issues need attention.</div> : <div className="rounded-lg bg-[#111827] p-4"><div className="font-bold">Blocked accounts</div><div className="mt-1 text-xs text-[#94a3b8]">{data.metrics.blockedUsers} accounts currently cannot sign in.</div></div>}</div></div>
    </section>
    <section className="mt-7 overflow-hidden rounded-xl border border-[#26344d] bg-[#111827]"><div className="flex items-center justify-between p-6 sm:p-8"><h2 className="font-editorial text-2xl font-bold">Recent Global Activity</h2><span className="text-[10px] uppercase tracking-wider text-[#94a3b8]">Live audit stream</span></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-[#151e2e] text-[9px] uppercase tracking-wider text-[#94a3b8]"><tr><th className="px-8 py-4">Event type</th><th className="px-8 py-4">User</th><th className="px-8 py-4">Module</th><th className="px-8 py-4">Timestamp</th></tr></thead><tbody>{data.recentActivity.map((item) => <tr key={item.id} className="border-t border-[#26344d]"><td className="px-8 py-4 font-semibold">{item.action}</td><td className="px-8 py-4 text-[#94a3b8]">{item.user?.fullName || 'System'}</td><td className="px-8 py-4"><span className="rounded bg-[#14251f] px-2 py-1 text-[10px] uppercase text-emerald-300">{item.module}</span></td><td className="px-8 py-4 text-xs text-[#94a3b8]">{new Date(item.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div></section>
  </main>
}
