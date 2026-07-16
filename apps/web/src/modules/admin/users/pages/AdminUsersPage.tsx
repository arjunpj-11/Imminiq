import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Eye,
  PauseCircle,
  Search,
  UserCheck,
  UserCog,
  UserRoundX,
  Users,
  Scale,
  Download,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { AdminBulkActionBar, AdminError } from '../../shared';
import { downloadServerCsv } from '../../shared';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import { useAdminUsers } from '../hooks/useAdminUsers';
import {
  ADMIN_USER_FILTERS,
  ADMIN_USERS_ROUTES,
  ADMIN_USERS_SEARCH_DEBOUNCE_MS,
} from '../constants/admin-users.constants';

const number = new Intl.NumberFormat('en-US');

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<(typeof ADMIN_USER_FILTERS)[number]>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const debouncedSearch = useDebouncedValue(search, ADMIN_USERS_SEARCH_DEBOUNCE_MS);
  const { data, isLoading, isError, error, isFetching } = useAdminUsers({
    search: debouncedSearch,
    status,
    page,
  });
  const statCards: Array<{ label: string; value: number; icon: LucideIcon; color: string }> = data
    ? [
        { label: 'Total users', value: data.stats.total, icon: Users, color: '#e8816a' },
        { label: 'Active accounts', value: data.stats.active, icon: UserCheck, color: '#52c58c' },
        { label: 'Suspended', value: data.stats.paused, icon: PauseCircle, color: '#f0a842' },
        { label: 'Blocked', value: data.stats.blocked, icon: UserRoundX, color: '#e26767' },
        { label: 'Unverified', value: data.stats.unverified, icon: UserCog, color: '#6aa9ff' },
      ]
    : [];
  const exportCurrentView = () => void downloadServerCsv('/admin/users/export.csv', `imminiq-users-${status}.csv`, { search: debouncedSearch, status });

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[.18em] text-[#e8816a]">
            Administration
          </div>
          <h1 className="font-editorial mt-1 text-4xl font-bold">User Management</h1>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3">
        <button type="button" onClick={exportCurrentView} className="admin-button inline-flex items-center gap-2"><Download size={16} /> Export all CSV</button>
        <Link to={ADMIN_USERS_ROUTES.appeals} className="admin-button inline-flex items-center gap-2"><Scale size={16} /> Account appeals</Link>
        <label className="flex min-w-[280px] flex-1 items-center gap-3 rounded-full border border-[rgba(255,255,255,0.16)] bg-[#24211e] px-5 py-3 md:max-w-[390px]">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Search users, names, emails…"
          />
        </label>
        </div>
      </div>
      {data && (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-xl border border-[rgba(255,255,255,0.09)] bg-[#1c1a18] p-6"
            >
              <div className="flex justify-between text-[10px] uppercase tracking-wide text-[#aaa59d]">
                <span>{label}</span>
                <Icon size={18} style={{ color }} />
              </div>
              <div className="font-editorial mt-6 text-2xl" style={{ color }}>
                {number.format(value)}
              </div>
            </div>
          ))}
        </section>
      )}
      <section className="mt-8 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.09)] bg-[#1c1a18]">
        <div className="flex flex-wrap items-center gap-5 border-b border-[rgba(255,255,255,0.09)] px-6 py-5">
          <h2 className="font-editorial mr-2 text-xl font-bold">All Users</h2>
          <div className="flex rounded-lg bg-[#2a2723] p-1">
            {ADMIN_USER_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setStatus(filter);
                  setPage(1);
                }}
                className={`rounded-md px-4 py-2 text-xs font-semibold capitalize ${status === filter ? 'bg-[rgba(232,129,106,0.15)] text-[#e8816a] shadow-sm' : 'text-[#aaa59d]'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="px-6 pt-4"><AdminBulkActionBar kind="users" selected={selected} onClear={() => setSelected([])} /></div>
        {isLoading && <div className="p-10 text-center text-sm text-[#aaa59d]">Loading users…</div>}
        {!isLoading && isFetching && (
          <div className="h-px animate-pulse bg-[#e8816a]" aria-label="Refreshing users" />
        )}
        {isError && <AdminError error={error} />}
        {data && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="border-b border-[rgba(255,255,255,0.16)] bg-[#141412] text-[9px] uppercase tracking-wider text-[#aaa59d]">
                  <tr>
                    <th className="px-6 py-4"><input aria-label="Select visible users" type="checkbox" checked={Boolean(data.users.length) && data.users.every((item) => selected.includes(item._id))} onChange={(event) => setSelected(event.target.checked ? Array.from(new Set([...selected, ...data.users.map((item) => item._id)])) : selected.filter((id) => !data.users.some((item) => item._id === id)))} /></th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Last activity</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user) => (
                    <tr
                      key={user._id}
                      className={`border-t border-[rgba(255,255,255,0.09)] text-sm ${user.status === 'blocked' ? 'bg-[rgba(226,103,103,0.08)]' : user.status === 'paused' ? 'bg-[rgba(240,168,66,0.06)]' : ''}`}
                    >
                      <td className="px-6 py-4"><input aria-label={`Select ${user.fullName}`} type="checkbox" checked={selected.includes(user._id)} onChange={(event) => setSelected(event.target.checked ? [...selected, user._id] : selected.filter((id) => id !== user._id))} /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#2a2723] font-editorial text-[#e8816a]">
                              {user.fullName
                                .split(' ')
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join('')}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold">{user.fullName}</div>
                            <div className="text-[11px] text-[#aaa59d]">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded border border-[rgba(255,255,255,0.09)] bg-[#2a2723] px-2 py-1 text-[9px] uppercase text-[#aaa59d]">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#aaa59d]">
                        {user.email || user.phone || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 font-semibold ${user.status === 'blocked' ? 'text-[#e26767]' : user.status === 'paused' ? 'text-[#f0a842]' : 'text-[#52c58c]'}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#aaa59d]">
                        {new Date(user.lastActiveAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={ADMIN_USERS_ROUTES.detail(user._id)}
                          className="inline-flex items-center gap-2 rounded-md border border-[rgba(255,255,255,0.09)] px-3 py-2 text-xs font-bold hover:bg-[#24211e]"
                        >
                          <Eye size={15} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.09)] bg-[#141412] px-6 py-5 text-xs text-[#aaa59d]">
              <span>
                Showing {data.users.length} of {number.format(data.pagination.total)} users
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                  className="rounded border border-[rgba(255,255,255,0.09)] p-2 disabled:opacity-30"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="px-2">
                  {page} / {data.pagination.pages}
                </span>
                <button
                  disabled={page >= data.pagination.pages}
                  onClick={() => setPage((value) => value + 1)}
                  className="rounded border border-[rgba(255,255,255,0.09)] p-2 disabled:opacity-30"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
        {data?.users.length === 0 && (
          <div className="p-12 text-center">
            <Ban className="mx-auto mb-3 text-[#aaa59d]" />
            <div className="font-semibold">No matching users</div>
          </div>
        )}
      </section>
    </main>
  );
}
