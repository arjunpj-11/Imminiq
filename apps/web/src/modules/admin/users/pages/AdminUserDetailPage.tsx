import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  BookOpenCheck,
  CheckCircle2,
  Coins,
  FileText,
  Flame,
  ShieldCheck,
  Unlock,
  UserRound,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ConfirmDialog from '../../../../components/overlays/ConfirmDialog';
import { AdminError } from '../../shared';
import { toast } from '../../../../lib/toast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { useState } from 'react';
import { useAdminUserDetail } from '../hooks/useAdminUserDetail';
import { useSetAdminUserStatus } from '../hooks/useSetAdminUserStatus';
import { ADMIN_USERS_ROUTES } from '../constants/admin-users.constants';

export default function AdminUserDetailPage() {
  const { userId = '' } = useParams();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data, isLoading, isError, error } = useAdminUserDetail(userId);
  const statusMutation = useSetAdminUserStatus(userId);
  if (isLoading) return <div className="p-10 text-sm">Loading user profile…</div>;
  if (isError || !data)
    return (
      <div className="p-10">
        <AdminError error={error} />
        <Link className="mt-4 inline-block text-sm text-[#e8816a]" to={ADMIN_USERS_ROUTES.list}>
          Return to users
        </Link>
      </div>
    );
  const { user, stats } = data;
  const blocked = user.status === 'blocked';
  const initials = user.fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
  const metricCards = [
    ['Current level', user.level ?? 1, UserRound],
    ['Total experience', user.xp ?? 0, BookOpenCheck],
    ['Scholar coins', user.coins ?? 0, Coins],
    ['Daily streak', user.streakCount ?? 0, Flame],
    ['Trackers active', stats.trackers, BookOpenCheck],
    ['Report files', stats.reports, FileText],
  ] as const;

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-7 sm:px-8">
      <Link
        to={ADMIN_USERS_ROUTES.list}
        className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#aaa59d]"
      >
        <ArrowLeft size={15} />
        User management
      </Link>
      <section className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex min-w-0 items-center gap-5">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-28 w-28 rounded-3xl object-cover" />
          ) : (
            <div className="grid h-28 w-28 shrink-0 place-items-center rounded-3xl bg-[#d4705a] font-editorial text-4xl text-white">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-editorial text-4xl font-bold">{user.fullName}</h1>
              <span
                className={`rounded-full px-3 py-1 text-xs ${blocked ? 'bg-[rgba(226,103,103,0.15)] text-[#e26767]' : 'bg-[rgba(82,197,140,0.15)] text-[#52c58c]'}`}
              >
                {user.status}
              </span>
              <span className="rounded-full bg-[#2a2723] px-3 py-1 text-xs">Role: {user.role}</span>
            </div>
            <p className="mt-3 break-all font-mono text-xs text-[#aaa59d]">
              @{user.username} · {user.email || user.phone || 'No contact'} · {user._id}
            </p>
            <div className="mt-3 flex gap-2">
              <span className="rounded border border-[rgba(82,197,140,0.25)] bg-[rgba(82,197,140,0.10)] px-2 py-1 text-[9px] text-[#52c58c]">
                {user.emailVerified || user.phoneVerified ? 'VERIFIED' : 'UNVERIFIED'}
              </span>
              {user.isPremium && (
                <span className="rounded border border-[rgba(240,168,66,0.25)] bg-[rgba(240,168,66,0.10)] px-2 py-1 text-[9px] text-[#f0a842]">
                  PLAN: PRO
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setConfirmOpen(true)}
          className={`inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-bold text-white ${blocked ? 'bg-[#52c58c]' : 'bg-[#e26767]'}`}
        >
          {blocked ? <Unlock size={17} /> : <Ban size={17} />}
          {blocked ? 'Unblock User' : 'Block User'}
        </button>
      </section>
      <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {metricCards.map(([label, value, Icon]) => (
          <div
            key={label}
            className="rounded-xl border border-[rgba(255,255,255,0.16)] bg-[#11110f] p-5"
          >
            <div className="flex items-start justify-between text-[9px] uppercase text-[#aaa59d]">
              <span>{label}</span>
              <Icon size={16} />
            </div>
            <div className="font-editorial mt-4 text-3xl">{Number(value).toLocaleString()}</div>
          </div>
        ))}
      </section>
      <section className="mt-7 grid items-start gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-xl border border-[rgba(255,255,255,0.09)] bg-[#1c1a18] p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-2xl font-bold">Recent Activity Timeline</h2>
              <span className="text-[10px] font-bold uppercase text-[#e8816a]">Audit history</span>
            </div>
            <div className="mt-6 space-y-6">
              {data.activity.length ? (
                data.activity.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <span
                      className={`mt-1 h-3 w-3 shrink-0 rounded-full ${item.severity === 'error' || item.severity === 'critical' ? 'bg-[#e26767]' : 'bg-[#52c58c]'}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{item.action}</div>
                      <div className="mt-1 text-xs text-[#aaa59d]">{item.module}</div>
                    </div>
                    <time className="text-[9px] uppercase text-[#aaa59d]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#aaa59d]">No recorded activity yet.</p>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-[rgba(255,255,255,0.09)] bg-[#1c1a18] p-6">
            <h2 className="font-editorial text-2xl font-bold">Account Information</h2>
            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-[9px] uppercase tracking-wider text-[#aaa59d]">Registered</dt>
                <dd className="mt-1 font-semibold">
                  {new Date(user.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-wider text-[#aaa59d]">Last active</dt>
                <dd className="mt-1 font-semibold">
                  {new Date(user.lastActiveAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-wider text-[#aaa59d]">Provider</dt>
                <dd className="mt-1 font-semibold capitalize">{user.provider || 'local'}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-wider text-[#aaa59d]">Subscription</dt>
                <dd className="mt-1 font-semibold">{user.isPremium ? 'Premium' : 'Free'}</dd>
              </div>
            </dl>
          </div>
        </div>
        <aside className="space-y-6">
          <div className="rounded-xl border border-[rgba(255,255,255,0.09)] bg-[#1c1a18] p-6 text-center">
            <div className="text-[9px] uppercase tracking-[.2em] text-[#aaa59d]">
              Account health score
            </div>
            <div className="mx-auto mt-6 grid h-32 w-32 place-items-center rounded-full border-[8px] border-[#52c58c]">
              <div>
                <div className="font-editorial text-4xl">{stats.trustScore}</div>
                <div className="font-mono text-[9px] text-[#aaa59d]">/100</div>
              </div>
            </div>
            <div className="mt-6 border-t border-[rgba(255,255,255,0.09)] pt-5 text-left text-sm">
              <div className="flex justify-between py-2">
                <span className="text-[#aaa59d]">Failed security events</span>
                <strong>{stats.failedSecurityEvents}</strong>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#aaa59d]">Identity</span>
                <strong className="text-[#52c58c]">Verified</strong>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[rgba(255,255,255,0.16)] bg-[#11110f] p-6">
            <h2 className="font-editorial text-xl font-bold">Security Events</h2>
            <div className="mt-5 space-y-3">
              {data.securityEvents.slice(0, 4).map((event) => (
                <div key={event.id} className="rounded-lg bg-[#24211e]/90 p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    {event.outcome === 'failure' ? (
                      <AlertTriangle size={14} className="text-[#f0a842]" />
                    ) : (
                      <CheckCircle2 size={14} className="text-[#52c58c]" />
                    )}
                    {event.eventType.replaceAll('_', ' ')}
                  </div>
                  <div className="mt-1 text-[9px] text-[#aaa59d]">
                    {new Date(event.createdAt).toLocaleString()}{' '}
                    {event.ipAddress ? `· ${event.ipAddress}` : ''}
                  </div>
                </div>
              ))}
              {data.securityEvents.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-[#52c58c]">
                  <ShieldCheck size={17} />
                  No security events found.
                </div>
              )}
            </div>
          </div>
        </aside>
      </section>
      <ConfirmDialog
        open={confirmOpen}
        title={`${blocked ? 'Unblock' : 'Block'} ${user.fullName}?`}
        description={
          blocked
            ? 'This user will regain access immediately and can sign in again.'
            : 'This user will be denied access on their next authenticated request and cannot sign in until unblocked.'
        }
        confirmText={blocked ? 'Unblock user' : 'Block user'}
        variant={blocked ? 'default' : 'danger'}
        isLoading={statusMutation.isPending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() =>
          statusMutation.mutate(blocked ? 'active' : 'blocked', {
            onSuccess: (_, status) => {
              setConfirmOpen(false);
              toast.success(
                status === 'blocked' ? 'User blocked' : 'User unblocked',
                'The account status was updated and added to the audit log.'
              );
            },
            onError: (error) =>
              toast.error(
                'Status update failed',
                getUserFacingError(error, 'Please check your permissions and try again.')
              ),
          })
        }
      />
    </main>
  );
}
