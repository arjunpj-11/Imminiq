import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  BookOpenCheck,
  CheckCircle2,
  Coins,
  FileText,
  Flame,
  MessageCircle,
  MonitorSmartphone,
  PauseCircle,
  ShieldCheck,
  Unlock,
  UserRound,
  UserCog,
  KeyRound,
} from 'lucide-react';
import { Link, useParams } from 'react-router';
import { AdminError } from '../../../../components/admin';
import { useState } from 'react';
import { useAdminUserDetail } from '../hooks/useAdminUserDetail';
import { ADMIN_USERS_ROUTES } from '../constants/admin-users.constants';
import AdminUserStatusDialog from '../components/AdminUserStatusDialog';
import AdminUserMessageDialog from '../components/AdminUserMessageDialog';
import AdminUserSessionDialog from '../components/AdminUserSessionDialog';
import AdminUserRoleDialog from '../components/AdminUserRoleDialog';
import type { AdminUserDetailData } from '../types/admin-users.types';
import { useAuthStore } from '../../../../store/useAuthStore';
import AdminUserNotesPanel from '../components/AdminUserNotesPanel';
import AdminActionPasswordDialog from '../components/AdminActionPasswordDialog';
import UserAvatar from '../../../../components/data-display/UserAvatar';

type UserStatusAction = 'suspend' | 'block' | 'restore';

function AdminUserDetailSkeleton() {
  return (
    <main
      className="mx-auto max-w-310 px-5 py-7 sm:px-8"
      role="status"
      aria-label="Loading user profile"
      aria-busy="true"
    >
      <span className="sr-only">Loading user profile…</span>
      <div aria-hidden="true">
        <div className="h-4 w-32 animate-pulse rounded bg-white/8" />
        <section className="mt-6 flex flex-wrap items-start justify-between gap-6">
          <div className="flex min-w-0 flex-1 items-center gap-5 max-[560px]:items-start">
            <div className="h-28 w-28 shrink-0 animate-pulse rounded-full bg-white/8 max-[560px]:h-20 max-[560px]:w-20" />
            <div className="min-w-0 flex-1">
              <div className="h-10 w-[min(24rem,75%)] animate-pulse rounded-lg bg-white/8" />
              <div className="mt-3 h-4 w-[min(34rem,92%)] animate-pulse rounded bg-white/8" />
              <div className="mt-3 h-7 w-44 animate-pulse rounded-full bg-white/8" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-28 animate-pulse rounded-lg bg-white/8" />
            <div className="h-10 w-24 animate-pulse rounded-lg bg-white/8" />
          </div>
        </section>
        <div className="mt-8 grid grid-cols-3 gap-4 max-[850px]:grid-cols-2 max-[520px]:grid-cols-1">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl border border-white/9 bg-white/4"
            />
          ))}
        </div>
        <div className="mt-7 grid grid-cols-[minmax(0,1fr)_20rem] gap-5 max-[900px]:grid-cols-1">
          <div className="h-96 animate-pulse rounded-xl border border-white/9 bg-white/4" />
          <div className="h-96 animate-pulse rounded-xl border border-white/9 bg-white/4" />
        </div>
      </div>
    </main>
  );
}

export default function AdminUserDetailPage() {
  const { userId = '' } = useParams();
  const [statusAction, setStatusAction] = useState<UserStatusAction | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<
    AdminUserDetailData['sessions'][number] | null
  >(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [actionPasswordOpen, setActionPasswordOpen] = useState(false);
  const currentUserId = useAuthStore((state) => state.user?._id);
  const currentUserRole = useAuthStore((state) => state.user?.role);
  const { data, isLoading, isError, error, refetch } = useAdminUserDetail(userId);
  if (isLoading) return <AdminUserDetailSkeleton />;
  if (isError || !data)
    return (
      <div className="p-10">
        <AdminError error={error} onRetry={() => void refetch()} />
        <Link className="mt-4 inline-block text-sm text-[#e8816a]" to={ADMIN_USERS_ROUTES.list}>
          Return to users
        </Link>
      </div>
    );
  const { user, stats } = data;
  const blocked = user.status === 'blocked';
  const paused = user.status === 'paused';
  const canChangeStatus = currentUserId !== user._id;
  const metricCards = [
    ['Current level', user.level ?? 1, UserRound],
    ['Total experience', user.xp ?? 0, BookOpenCheck],
    ['Scholar coins', user.coins ?? 0, Coins],
    ['Daily streak', user.streakCount ?? 0, Flame],
    ['Trackers active', stats.trackers, BookOpenCheck],
    ['Report files', stats.reports, FileText],
  ] as const;

  return (
    <main className="mx-auto max-w-310 px-5 py-7 sm:px-8">
      <Link
        to={ADMIN_USERS_ROUTES.list}
        className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#aaa59d]"
      >
        <ArrowLeft size={15} />
        User management
      </Link>
      <section className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex min-w-0 items-center gap-5">
          <UserAvatar
            name={user.fullName}
            src={user.avatarUrl}
            sizeClassName="h-24 w-24 text-3xl sm:h-28 sm:w-28"
            className="rounded-full border-4 border-[#24211e] shadow-[0_14px_34px_rgba(0,0,0,.32)]"
            imageLoading="eager"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-editorial text-4xl font-bold">{user.fullName}</h1>
              <span
                className={`rounded-full px-3 py-1 text-xs ${blocked ? 'bg-[rgba(226,103,103,0.15)] text-[#e26767]' : paused ? 'bg-[rgba(240,168,66,0.15)] text-[#f0a842]' : 'bg-[rgba(82,197,140,0.15)] text-[#52c58c]'}`}
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
        <div className="flex flex-wrap gap-2">
          {currentUserRole === 'superadmin' &&
            currentUserId !== user._id &&
            ['admin', 'moderator'].includes(user.role) && (
              <button
                type="button"
                onClick={() => setActionPasswordOpen(true)}
                className="admin-button inline-flex items-center gap-2"
              >
                <KeyRound size={17} />
                {user.adminActionPasswordConfigured ? 'Reset' : 'Set'} action password
              </button>
            )}
          {currentUserRole === 'superadmin' &&
            currentUserId !== user._id &&
            user.role !== 'superadmin' && (
              <button
                type="button"
                onClick={() => setRoleOpen(true)}
                className="admin-button inline-flex items-center gap-2"
              >
                <UserCog size={17} /> Change role
              </button>
            )}
          <button
            type="button"
            onClick={() => setMessageOpen(true)}
            className="admin-button inline-flex items-center gap-2"
          >
            <MessageCircle size={17} /> Message
          </button>
          {canChangeStatus && user.status === 'active' && (
            <button
              type="button"
              onClick={() => setStatusAction('suspend')}
              className="admin-button inline-flex items-center gap-2 text-[#f0a842]"
            >
              <PauseCircle size={17} /> Suspend
            </button>
          )}
          {canChangeStatus && user.status !== 'blocked' && (
            <button
              type="button"
              onClick={() => setStatusAction('block')}
              className="admin-button inline-flex items-center gap-2 text-[#e26767]"
            >
              <Ban size={17} /> Block
            </button>
          )}
          {canChangeStatus && user.status !== 'active' && (
            <button
              type="button"
              onClick={() => setStatusAction('restore')}
              className="admin-primary-button inline-flex items-center gap-2"
            >
              <Unlock size={17} /> Restore
            </button>
          )}
        </div>
      </section>
      {user.adminStatusReason && (
        <section className="mt-5 rounded-xl border border-[#f0a842]/30 bg-[#f0a842]/10 p-4 text-sm leading-6 text-[#f0c060]">
          <strong>Latest administrative reason:</strong> {user.adminStatusReason}
          {user.adminStatusChangedAt && (
            <span className="ml-2 text-xs text-[#aaa59d]">
              · {new Date(user.adminStatusChangedAt).toLocaleString()}
            </span>
          )}
        </section>
      )}
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
          <AdminUserNotesPanel userId={user._id} />
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
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-2xl font-bold">Active Sessions</h2>
              <span className="text-xs text-[#aaa59d]">{data.sessions.length} devices</span>
            </div>
            <div className="mt-5 space-y-3">
              {data.sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#24211e] p-4"
                >
                  <div className="flex min-w-0 gap-3">
                    <MonitorSmartphone size={18} className="mt-1 shrink-0 text-[#e8816a]" />
                    <div className="min-w-0">
                      <div className="font-semibold">{session.device}</div>
                      <div className="mt-1 truncate text-xs text-[#aaa59d]">
                        {session.ipAddress} · {session.userAgent}
                      </div>
                      <div className="mt-1 text-[10px] text-[#817c75]">
                        Last active {new Date(session.lastActiveAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <button
                    className="admin-button text-[#e26767]"
                    onClick={() => setSelectedSession(session)}
                  >
                    Revoke
                  </button>
                </div>
              ))}
              {!data.sessions.length && (
                <p className="text-sm text-[#aaa59d]">No active sessions.</p>
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
            <div className="mx-auto mt-6 grid h-32 w-32 place-items-center rounded-full border-8 border-[#52c58c]">
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
      <AdminUserStatusDialog
        key={`${user._id}-${statusAction ?? 'closed'}`}
        user={statusAction ? user : null}
        action={statusAction ?? 'suspend'}
        onClose={() => setStatusAction(null)}
      />
      <AdminUserMessageDialog
        key={`${user._id}-${messageOpen ? 'message' : 'closed-message'}`}
        user={messageOpen ? user : null}
        onClose={() => setMessageOpen(false)}
      />
      <AdminUserSessionDialog
        key={selectedSession?.id ?? 'closed-session'}
        userId={user._id}
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
      <AdminUserRoleDialog
        key={roleOpen ? `${user._id}-role` : 'closed-role'}
        user={roleOpen ? user : null}
        onClose={() => setRoleOpen(false)}
      />
      <AdminActionPasswordDialog
        key={actionPasswordOpen ? `${user._id}-action-password` : 'closed-action-password'}
        user={actionPasswordOpen ? user : null}
        onClose={() => setActionPasswordOpen(false)}
      />
    </main>
  );
}
