import { useState, type FormEvent } from 'react';
import { ChevronLeft, ChevronRight, Plus, Send, UsersRound, Vote, X } from 'lucide-react';
import {
  AdminEmpty,
  AdminError,
  AdminListSkeleton,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '../../../../components/admin';
import { useAdminBroadcasts } from '../hooks/useAdminBroadcasts';
import { useCreateAdminBroadcast } from '../hooks/useCreateAdminBroadcast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import ConfirmDialog from '../../../../components/admin/AdminConfirmDialog';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import { AdminSearch } from '../../../../components/admin';
import { useAdminUsers } from '../../users';
import type { AdminBroadcastAudience, AdminBroadcastPoll } from '../types/admin-broadcast.types';
import AdminActionPasswordField from '../../../../components/admin/AdminActionPasswordField';
import { isAdminActionPasswordReady } from '../../../../lib/admin/admin-action-password';

export default function AdminBroadcastPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data, isLoading, isError, isFetching, isPlaceholderData, error, refetch } =
    useAdminBroadcasts(page, useDebouncedValue(search, 300));
  const create = useCreateAdminBroadcast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<AdminBroadcastAudience>('all');
  const [deepLink, setDeepLink] = useState('');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Array<{ id: string; label: string }>>([]);
  const [poll, setPoll] = useState<AdminBroadcastPoll | null>(null);
  const [actionPassword, setActionPassword] = useState('');
  const recipientOptions = useAdminUsers({
    search: useDebouncedValue(recipientSearch, 250),
    status: 'active',
    page: 1,
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setConfirmOpen(true);
  };
  const send = () => {
    create.mutate(
      {
        title,
        message,
        audience,
        ...(audience === 'custom' ? { userIds: selectedUsers.map((user) => user.id) } : {}),
        deepLink: deepLink.trim() || undefined,
        ...(poll ? { poll } : {}),
        actionPassword,
      },
      {
        onSuccess: () => {
          setTitle('');
          setMessage('');
          setDeepLink('');
          setSelectedUsers([]);
          setRecipientSearch('');
          setPoll(null);
          setActionPassword('');
          setConfirmOpen(false);
          setPage(1);
        },
      }
    );
  };
  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="Broadcast Centre"
        description="Send in-app announcements to registered users who have platform announcements enabled."
      />
      <AdminMetricGrid
        metrics={[
          { label: 'Broadcasts sent', value: data?.stats?.sent ?? 0 },
          {
            label: 'Total deliveries',
            value: data?.stats?.recipients ?? 0,
            tone: 'success',
          },
        ]}
      />
      <div className="grid items-start gap-7 xl:grid-cols-[minmax(390px,.9fr)_minmax(0,1.1fr)]">
        <AdminPanel title="Compose broadcast">
          <form onSubmit={submit} className="flex flex-col gap-4 p-6">
            <div className="rounded-xl border border-[#e8816a]/25 bg-linear-to-br from-[#e8816a]/12 to-transparent p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <UsersRound size={16} className="text-[#e8816a]" /> Audience studio
              </div>
              <p className="mt-1 text-xs leading-5 text-[#aaa59d]">
                Choose a community segment or hand-pick recipients for a focused message.
              </p>
            </div>
            <label className="admin-field">
              <span>Title</span>
              <input
                required
                minLength={3}
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>Message</span>
              <textarea
                required
                minLength={3}
                maxLength={500}
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            <fieldset>
              <legend className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#aaa59d]">
                Audience
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ['all', 'Everyone'],
                    ['active', 'Active 30d'],
                    ['free', 'Free'],
                    ['pro', 'Pro'],
                    ['premium', 'Premium'],
                    ['custom', 'Selected users'],
                  ] as Array<[AdminBroadcastAudience, string]>
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={audience === value}
                    onClick={() => setAudience(value)}
                    className={`rounded-lg border px-3 py-2.5 text-left text-xs font-semibold transition ${audience === value ? 'border-[#e8816a] bg-[#e8816a]/12 text-[#f2f0eb]' : 'border-white/10 bg-[#24211e] text-[#aaa59d] hover:border-white/25'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
            {audience === 'custom' && (
              <div className="rounded-xl border border-white/10 bg-[#24211e] p-3">
                <label className="admin-field">
                  <span>Find active users</span>
                  <input
                    value={recipientSearch}
                    onChange={(event) => setRecipientSearch(event.target.value)}
                    placeholder="Name, username, or email"
                  />
                </label>
                {selectedUsers.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <span
                        key={user.id}
                        className="inline-flex items-center gap-1 rounded-full bg-[#e8816a]/12 px-2 py-1 text-xs"
                      >
                        <span>{user.label}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${user.label}`}
                          onClick={() =>
                            setSelectedUsers((current) =>
                              current.filter((item) => item.id !== user.id)
                            )
                          }
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {recipientSearch && (
                  <div className="mt-3 max-h-40 space-y-1 overflow-y-auto">
                    {recipientOptions.data?.users
                      .filter((user) => !selectedUsers.some((selected) => selected.id === user._id))
                      .map((user) => (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => {
                            setSelectedUsers((current) => [
                              ...current,
                              {
                                id: user._id,
                                label: `${user.fullName} (@${user.username})`,
                              },
                            ]);
                            setRecipientSearch('');
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs hover:bg-white/8"
                        >
                          <span>
                            {user.fullName} <span className="text-[#817c75]">@{user.username}</span>
                          </span>
                          <Plus size={14} />
                        </button>
                      ))}
                  </div>
                )}
                <p className="mt-3 text-xs text-[#817c75]">
                  {selectedUsers.length
                    ? `${selectedUsers.length} recipient${selectedUsers.length === 1 ? '' : 's'} selected`
                    : 'Search and add at least one recipient.'}
                </p>
              </div>
            )}
            <div className="rounded-xl border border-white/10 bg-[#24211e] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Vote size={16} className="text-[#e8816a]" /> Add a poll
                  </div>
                  <p className="mt-1 text-xs text-[#aaa59d]">
                    Collect one response from each recipient.
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-button"
                  onClick={() =>
                    setPoll((current) => (current ? null : { question: '', options: ['', ''] }))
                  }
                >
                  {poll ? 'Remove' : 'Add poll'}
                </button>
              </div>
              {poll && (
                <div className="mt-4 space-y-3">
                  <label className="admin-field">
                    <span>Poll question</span>
                    <input
                      required
                      value={poll.question}
                      maxLength={180}
                      onChange={(event) =>
                        setPoll((current) =>
                          current ? { ...current, question: event.target.value } : current
                        )
                      }
                    />
                  </label>
                  {poll.options.map((option, index) => (
                    <label key={index} className="admin-field">
                      <span>Option {index + 1}</span>
                      <input
                        required
                        value={option}
                        maxLength={100}
                        onChange={(event) =>
                          setPoll((current) =>
                            current
                              ? {
                                  ...current,
                                  options: current.options.map((value, optionIndex) =>
                                    optionIndex === index ? event.target.value : value
                                  ),
                                }
                              : current
                          )
                        }
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
            <label className="admin-field">
              <span>Open destination (optional)</span>
              <input
                pattern="/(?!/).*"
                maxLength={300}
                placeholder="/notifications"
                value={deepLink}
                onChange={(e) => setDeepLink(e.target.value)}
              />
              <small>Internal path opened when a user selects the notification.</small>
            </label>
            {create.isError && (
              <p className="text-sm text-[#e26767]">
                {getUserFacingError(create.error, 'The broadcast could not be sent.')}
              </p>
            )}
            <AdminActionPasswordField
              value={actionPassword}
              onChange={setActionPassword}
              className="admin-field block"
            />
            <div className="flex justify-end border-t border-white/10 pt-4">
              <button
                disabled={
                  create.isPending ||
                  !isAdminActionPasswordReady(actionPassword) ||
                  (audience === 'custom' && selectedUsers.length === 0)
                }
                className="admin-primary-button min-w-42.5 shrink-0 whitespace-nowrap"
              >
                <Send size={16} />
                {create.isPending ? 'Sending…' : 'Send broadcast'}
              </button>
            </div>
          </form>
        </AdminPanel>
        <AdminPanel
          title="Delivery history"
          toolbar={
            <div className="flex flex-wrap items-center gap-3">
              {data && (
                <span className="text-xs text-[#817c75]">
                  {data.pagination.total.toLocaleString()} broadcasts
                </span>
              )}
              <AdminSearch
                value={search}
                onChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                placeholder="Search broadcasts…"
              />
            </div>
          }
        >
          {isLoading || isPlaceholderData ? (
            <AdminListSkeleton rows={6} label="Loading broadcast history" />
          ) : isError ? (
            <AdminError error={error} onRetry={() => void refetch()} />
          ) : !data?.items.length ? (
            <AdminEmpty>No broadcasts have been sent.</AdminEmpty>
          ) : (
            <>
              <div
                className={`divide-y divide-white/10 transition-opacity ${isFetching && !isPlaceholderData ? 'opacity-75' : ''}`}
              >
                {data.items.map((item) => (
                  <article key={item.id} className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{item.title}</h3>
                        <p className="mt-2 line-clamp-3 wrap-break-word text-sm leading-6 text-[#aaa59d]">
                          {item.message}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <AdminStatusBadge value={item.status} />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-2 gap-y-1 text-xs text-[#817c75]">
                      <span>{item.recipientCount.toLocaleString()} recipients</span>
                      <span>·</span>
                      <span className="capitalize">
                        {item.audience === 'custom' ? 'Selected users' : item.audience}
                      </span>
                      <span>·</span>
                      <span>{new Date(item.sentAt).toLocaleString()}</span>
                      {item.deepLink && (
                        <>
                          <span>·</span>
                          <span>{item.deepLink}</span>
                        </>
                      )}
                    </div>
                    {item.poll && <PollResults poll={item.poll} />}
                  </article>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-white/10 bg-[#141412] px-5 py-4">
                <span className="text-xs text-[#817c75]">
                  Page {data.pagination.page} of {data.pagination.pages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous broadcast page"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((value) => value - 1)}
                    className="admin-icon-button grid h-9 w-9 place-items-center p-0"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next broadcast page"
                    disabled={page >= data.pagination.pages || isFetching}
                    onClick={() => setPage((value) => value + 1)}
                    className="admin-icon-button grid h-9 w-9 place-items-center p-0"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </AdminPanel>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Send this broadcast now?"
        description={`This immediately creates an in-app notification for ${audienceLabel(audience, selectedUsers.length)}${poll ? ' and includes a one-response poll.' : '.'} This cannot be recalled.`}
        confirmText="Send now"
        isLoading={create.isPending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={send}
      />
    </main>
  );
}

function audienceLabel(audience: AdminBroadcastAudience, selectedUsers: number) {
  if (audience === 'custom')
    return `${selectedUsers} selected user${selectedUsers === 1 ? '' : 's'}`;
  return (
    {
      all: 'all eligible registered users',
      active: 'eligible users active in the last 30 days',
      free: 'eligible free users',
      pro: 'eligible Pro users',
      premium: 'eligible Premium users',
    } as const
  )[audience];
}

function PollResults({ poll }: { poll: AdminBroadcastPoll }) {
  const total = poll.totalVotes ?? 0;
  return (
    <div className="mt-4 rounded-xl border border-[#e8816a]/20 bg-[#e8816a]/6 p-4">
      <div className="flex items-center justify-between gap-3">
        <strong className="text-sm">{poll.question}</strong>
        <span className="text-xs text-[#aaa59d]">
          {total} vote{total === 1 ? '' : 's'}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {poll.options.map((option, index) => {
          const votes = poll.votes?.[index] ?? 0;
          const share = total ? Math.round((votes / total) * 100) : 0;
          return (
            <div key={option}>
              <div className="mb-1 flex justify-between text-xs">
                <span>{option}</span>
                <span className="text-[#aaa59d]">
                  {share}% · {votes}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[#e8816a]" style={{ width: `${share}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
