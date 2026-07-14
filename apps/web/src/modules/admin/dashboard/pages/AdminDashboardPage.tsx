import {
  Activity,
  CheckCircle2,
  CircleUserRound,
  Radio,
  RefreshCw,
  ShieldBan,
  Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import AdminDashboardState from '../components/AdminDashboardState';

const number = new Intl.NumberFormat('en-US');

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error, isFetching, refetch } = useAdminDashboard();
  if (isLoading) return <AdminDashboardState tone="loading" />;
  if (isError || !data) return <AdminDashboardState tone="error" error={error} />;

  const metrics = [
    ['Total users', data.metrics.totalUsers, CircleUserRound, '#e8816a'],
    ['Active today', data.metrics.activeToday, Activity, '#52c58c'],
    ['Total trackers', data.metrics.totalTrackers, Target, '#6aa9ff'],
    ['Blocked users', data.metrics.blockedUsers, ShieldBan, '#e26767'],
  ] as const;
  const peak = Math.max(...data.weeklyActivity, 1);

  return (
    <main className="mx-auto max-w-310 px-5 py-9 sm:px-8">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#e8816a]">
            Admin console <Radio size={12} className="text-[#52c58c]" /> Live data
          </div>
          <h1 className="font-editorial text-4xl font-bold sm:text-5xl">Performance Overview</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right font-mono text-xs text-[#aaa59d]">
            {new Date().toLocaleString()}
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-label="Refresh dashboard data"
            className="grid h-9 w-9 place-items-center rounded-md border border-[rgba(255,255,255,0.09)] text-[#aaa59d] hover:bg-[#2a2723] hover:text-[#e8816a] disabled:opacity-50"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, Icon, color]) => (
          <div
            key={label}
            className="relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.09)] bg-[#1c1a18] p-6"
          >
            <span className="absolute inset-y-0 left-0 w-1" style={{ background: color }} />
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#aaa59d]">
              {label}
              <Icon size={17} style={{ color }} />
            </div>
            <div className="font-editorial mt-5 text-3xl font-bold">{number.format(value)}</div>
          </div>
        ))}
      </section>
      <section className="mt-7 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="rounded-xl border border-[rgba(255,255,255,0.09)] bg-[#1c1a18] p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-2xl font-bold">Platform Activity</h2>
            <span className="rounded-md bg-[#1c1a18] px-3 py-1.5 text-xs">7D</span>
          </div>
          <div className="mt-9 flex h-64 items-end gap-3 border-b border-[rgba(255,255,255,0.16)] px-2 sm:gap-6">
            {data.weeklyActivity.map((value, index) => (
              <div key={index} className="flex h-full flex-1 flex-col justify-end">
                <div
                  className="rounded-t-sm bg-[#2a2723] transition-all"
                  style={{
                    height: `${Math.max(8, (value / peak) * 90)}%`,
                    background: value === peak ? '#e8816a' : undefined,
                  }}
                />
                <span className="pt-3 text-center text-[9px] text-[#aaa59d]">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-[rgba(255,255,255,0.09)] bg-[#1c1a18] p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-editorial text-2xl font-bold">User Health</h2>
            <Link to="/admin/users" className="text-[10px] font-bold uppercase text-[#e8816a]">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {data.metrics.blockedUsers === 0 ? (
              <div className="rounded-lg bg-[#1c1a18] p-5 text-sm">
                <CheckCircle2 className="mb-3 text-[#52c58c]" />
                No user issues need attention.
              </div>
            ) : (
              <div className="rounded-lg bg-[#1c1a18] p-4">
                <div className="font-bold">Blocked accounts</div>
                <div className="mt-1 text-xs text-[#aaa59d]">
                  {data.metrics.blockedUsers} accounts currently cannot sign in.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="mt-7 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.09)] bg-[#1c1a18]">
        <div className="flex items-center justify-between p-6 sm:p-8">
          <h2 className="font-editorial text-2xl font-bold">Recent Global Activity</h2>
          <span className="text-[10px] uppercase tracking-wider text-[#aaa59d]">
            Live audit stream
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-162.5 text-left text-sm">
            <thead className="border-b border-[rgba(255,255,255,0.16)] bg-[#141412] text-[9px] uppercase tracking-wider text-[#aaa59d]">
              <tr>
                <th className="px-8 py-4">Event type</th>
                <th className="px-8 py-4">User</th>
                <th className="px-8 py-4">Module</th>
                <th className="px-8 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data.recentActivity.map((item) => (
                <tr key={item.id} className="border-t border-[rgba(255,255,255,0.09)]">
                  <td className="px-8 py-4 font-semibold">{item.action}</td>
                  <td className="px-8 py-4 text-[#aaa59d]">{item.user?.fullName || 'System'}</td>
                  <td className="px-8 py-4">
                    <span className="rounded bg-[rgba(82,197,140,0.15)] px-2 py-1 text-[10px] uppercase text-[#52c58c]">
                      {item.module}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-xs text-[#aaa59d]">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
