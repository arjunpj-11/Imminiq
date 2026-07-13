import { Ban, ChevronLeft, ChevronRight, Eye, Search, UserCheck, UserRoundX, Users } from 'lucide-react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminUsers } from './admin-users.api'
import type { LucideIcon } from 'lucide-react'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'

const filters = ['all', 'active', 'blocked'] as const
const number = new Intl.NumberFormat('en-US')

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<(typeof filters)[number]>('all')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search, 300)
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['admin', 'users', debouncedSearch, status, page],
    queryFn: () => getAdminUsers({ search: debouncedSearch, status, page }),
    placeholderData: keepPreviousData,
    staleTime: 20_000,
  })
  const statCards: Array<{ label: string; value: number; icon: LucideIcon; color: string }> = data ? [
    { label: 'Total users', value: data.stats.total, icon: Users, color: '#67e8f9' },
    { label: 'Active now', value: data.stats.active, icon: UserCheck, color: '#34d399' },
    { label: 'Blocked', value: data.stats.blocked, icon: UserRoundX, color: '#fb7185' },
  ] : []

  return <main className="mx-auto max-w-[1240px] px-5 py-8 sm:px-8">
    <div className="flex flex-wrap items-center justify-between gap-5"><div><div className="text-[10px] font-bold uppercase tracking-[.18em] text-[#67e8f9]">Administration</div><h1 className="font-editorial mt-1 text-4xl font-bold">User Management</h1></div><label className="flex min-w-[280px] flex-1 items-center gap-3 rounded-full border border-[#334155] bg-[#111827] px-5 py-3 md:max-w-[390px]"><Search size={18} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} className="w-full bg-transparent text-sm outline-none" placeholder="Search users, names, emails…" /></label></div>
    {data && <section className="mt-8 grid gap-4 sm:grid-cols-3">{statCards.map(({ label, value, icon: Icon, color }) => <div key={label} className="rounded-xl border border-[#26344d] bg-[#111827] p-6"><div className="flex justify-between text-[10px] uppercase tracking-wide text-[#94a3b8]"><span>{label}</span><Icon size={18} style={{ color }} /></div><div className="font-editorial mt-6 text-2xl" style={{ color }}>{number.format(value)}</div></div>)}</section>}
    <section className="mt-8 overflow-hidden rounded-xl border border-[#26344d] bg-[#111827]">
      <div className="flex flex-wrap items-center gap-5 border-b border-[#26344d] px-6 py-5"><h2 className="font-editorial mr-2 text-xl font-bold">All Users</h2><div className="flex rounded-lg bg-[#172033] p-1">{filters.map((filter) => <button key={filter} onClick={() => { setStatus(filter); setPage(1) }} className={`rounded-md px-4 py-2 text-xs font-semibold capitalize ${status === filter ? 'bg-[#111827] shadow-sm' : 'text-[#94a3b8]'}`}>{filter}</button>)}</div></div>
      {isLoading && <div className="p-10 text-center text-sm text-[#94a3b8]">Loading users…</div>}
      {!isLoading && isFetching && <div className="h-px animate-pulse bg-[#67e8f9]" aria-label="Refreshing users" />}
      {isError && <div className="p-10 text-center text-sm text-rose-400">Users could not be loaded.</div>}
      {data && <><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead className="bg-[#0d1420] text-[9px] uppercase tracking-wider text-[#94a3b8]"><tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Last activity</th><th className="px-6 py-4 text-right">Action</th></tr></thead><tbody>{data.users.map((user) => <tr key={user._id} className={`border-t border-[#26344d] text-sm ${user.status === 'blocked' ? 'bg-rose-500/5' : ''}`}><td className="px-6 py-4"><div className="flex items-center gap-3">{user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="grid h-10 w-10 place-items-center rounded-full bg-[#172033] font-editorial text-[#67e8f9]">{user.fullName.split(' ').map((part) => part[0]).slice(0,2).join('')}</div>}<div><div className="font-semibold">{user.fullName}</div><div className="text-[11px] text-[#94a3b8]">@{user.username}</div></div></div></td><td className="px-6 py-4"><span className="rounded border border-[#26344d] px-2 py-1 text-[9px] uppercase">{user.role}</span></td><td className="px-6 py-4 text-[#94a3b8]">{user.email || user.phone || '—'}</td><td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 font-semibold ${user.status === 'blocked' ? 'text-rose-400' : 'text-emerald-300'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{user.status}</span></td><td className="px-6 py-4 text-[#94a3b8]">{new Date(user.lastActiveAt).toLocaleDateString()}</td><td className="px-6 py-4 text-right"><Link to={`/admin/users/${user._id}`} className="inline-flex items-center gap-2 rounded-md border border-[#26344d] px-3 py-2 text-xs font-bold hover:bg-[#172033]"><Eye size={15} />View</Link></td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-[#26344d] bg-[#0d1420] px-6 py-5 text-xs text-[#94a3b8]"><span>Showing {data.users.length} of {number.format(data.pagination.total)} users</span><div className="flex items-center gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded border border-[#26344d] p-2 disabled:opacity-30"><ChevronLeft size={15} /></button><span className="px-2">{page} / {data.pagination.pages}</span><button disabled={page >= data.pagination.pages} onClick={() => setPage((value) => value + 1)} className="rounded border border-[#26344d] p-2 disabled:opacity-30"><ChevronRight size={15} /></button></div></div></>}
      {data?.users.length === 0 && <div className="p-12 text-center"><Ban className="mx-auto mb-3 text-[#94a3b8]" /><div className="font-semibold">No matching users</div></div>}
    </section>
  </main>
}
