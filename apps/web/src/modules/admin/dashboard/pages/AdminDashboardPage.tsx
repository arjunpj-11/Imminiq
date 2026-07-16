import { CheckCircle2, Flag, RefreshCw, ShieldAlert, TicketCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import AdminDashboardState from '../components/AdminDashboardState';
import { ADMIN_ROUTES } from '../../../../routes/config/route-paths';
import { AdminMetricGrid, AdminPageHeader } from '../../shared';

export default function AdminDashboardPage() {
  const [metricView, setMetricView] = useState<'platform' | 'moderation'>('platform');
  const { data, isLoading, isError, error, isFetching, refetch } = useAdminDashboard();
  if (isLoading) return <AdminDashboardState tone="loading" />;
  if (isError || !data) return <AdminDashboardState tone="error" error={error} />;

  const peak = Math.max(...data.weeklyActivity, 1);

  return (
    <main className="mx-auto max-w-310 px-5 py-9 sm:px-8">
      <AdminPageHeader
        title="Performance Overview"
        description="Live platform health, usage, and moderation signals."
        action={
          <div className="flex items-center gap-3">
          {data.accessScope === 'full' && <div className="flex rounded-lg bg-[#24211e] p-1"><button className={`rounded-md px-3 py-1.5 text-xs ${metricView === 'platform' ? 'bg-[#e8816a]/15 text-[#e8816a]' : 'text-[#aaa59d]'}`} onClick={() => setMetricView('platform')}>Platform</button><button className={`rounded-md px-3 py-1.5 text-xs ${metricView === 'moderation' ? 'bg-[#e8816a]/15 text-[#e8816a]' : 'text-[#aaa59d]'}`} onClick={() => setMetricView('moderation')}>Moderation</button></div>}
          <div className="text-right font-mono text-xs text-[#aaa59d]">
            Updated {new Date(data.generatedAt).toLocaleString()}
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
        }
      />
      <AdminMetricGrid
        metrics={
          data.accessScope === 'moderation' || metricView === 'moderation'
            ? [
                { label: 'Open reports', value: data.metrics.openQuestionReports, tone: 'error' },
                { label: 'In review', value: data.metrics.reviewingQuestionReports, tone: 'warning' },
                { label: 'Question SLA overdue', value: data.metrics.overdueQuestionReports, tone: 'error' },
                { label: 'Tracker SLA overdue', value: data.metrics.overdueTrackerReports, tone: 'error' },
                { label: 'Content appeals', value: data.metrics.pendingContentAppeals, tone: 'warning' },
                { label: 'Privacy SLA overdue', value: data.metrics.overduePrivacyRequests, tone: 'error' },
              ]
            : [
                { label: 'Total users', value: data.metrics.totalUsers, tone: 'accent' },
                { label: 'Active today', value: data.metrics.activeToday, tone: 'success' },
                { label: 'Total trackers', value: data.metrics.totalTrackers, tone: 'info' },
                { label: 'Blocked users', value: data.metrics.blockedUsers, tone: 'error' },
                { label: 'Privacy requests', value: data.metrics.pendingPrivacyRequests, tone: 'warning' },
              ]
        }
      />
      <section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link
          to={ADMIN_ROUTES.mockTestReports}
          className="rounded-xl border border-[#e26767]/30 bg-[#e26767]/10 p-5 transition hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-2 font-semibold text-[#e26767]"><ShieldAlert size={18} /> Question reports</div>
          <div className="font-editorial mt-3 text-3xl">{data.metrics.openQuestionReports}</div>
          <p className="mt-1 text-xs text-[#aaa59d]">{data.metrics.reviewingQuestionReports} currently under review</p>
        </Link>
        <Link
          to={ADMIN_ROUTES.supportTickets}
          className="rounded-xl border border-[#f0a842]/30 bg-[#f0a842]/10 p-5 transition hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-2 font-semibold text-[#f0a842]"><TicketCheck size={18} /> Urgent support</div>
          <div className="font-editorial mt-3 text-3xl">{data.metrics.urgentSupportTickets}</div>
          <p className="mt-1 text-xs text-[#aaa59d]">Open or in-progress urgent tickets</p>
        </Link>
        <Link
          to={`${ADMIN_ROUTES.mockTests}?status=suspended`}
          className="rounded-xl border border-[#6aa9ff]/30 bg-[#6aa9ff]/10 p-5 transition hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-2 font-semibold text-[#6aa9ff]"><ShieldAlert size={18} /> Suspended tests</div>
          <div className="font-editorial mt-3 text-3xl">{data.metrics.suspendedMockTests}</div>
          <p className="mt-1 text-xs text-[#aaa59d]">Awaiting correction, appeal, or deletion</p>
        </Link>
        <Link
          to={ADMIN_ROUTES.trackerReports}
          className="rounded-xl border border-[#e26767]/30 bg-[#e26767]/10 p-5 transition hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-2 font-semibold text-[#e26767]"><Flag size={18} /> Tracker reports</div>
          <div className="font-editorial mt-3 text-3xl">{data.metrics.openTrackerReports}</div>
          <p className="mt-1 text-xs text-[#aaa59d]">Open or currently under review</p>
        </Link>
        <Link
          to={`${ADMIN_ROUTES.trackers}?status=suspended`}
          className="rounded-xl border border-[#f0a842]/30 bg-[#f0a842]/10 p-5 transition hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-2 font-semibold text-[#f0a842]"><ShieldAlert size={18} /> Suspended trackers</div>
          <div className="font-editorial mt-3 text-3xl">{data.metrics.suspendedTrackers}</div>
          <p className="mt-1 text-xs text-[#aaa59d]">Awaiting correction, appeal, or deletion</p>
        </Link>
      </section>
      <section className={`mt-7 grid gap-6 ${data.accessScope === 'full' ? 'lg:grid-cols-[1.55fr_1fr]' : ''}`}>
        {data.accessScope === 'full' && <div className="rounded-xl border border-[rgba(255,255,255,0.09)] bg-[#1c1a18] p-6 sm:p-8">
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
        </div>}
        <div className="rounded-xl border border-[rgba(255,255,255,0.09)] bg-[#1c1a18] p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-editorial text-2xl font-bold">User Health</h2>
            <Link
              to={ADMIN_ROUTES.users}
              className="text-[10px] font-bold uppercase text-[#e8816a]"
            >
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
            {data.metrics.suspendedUsers > 0 && (
              <div className="rounded-lg bg-[#1c1a18] p-4">
                <div className="font-bold">Suspended accounts</div>
                <div className="mt-1 text-xs text-[#aaa59d]">
                  {data.metrics.suspendedUsers} accounts are temporarily restricted.
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
