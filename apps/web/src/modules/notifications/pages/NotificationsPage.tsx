import { Bell, Check, CheckCheck, CircleAlert, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/layout/PageHeader';
import SkeletonBlock from '../../../components/feedback/SkeletonBlock';
import { cn } from '../../../lib/cn';
import { useNotifications } from '../hooks/useNotifications';
import { useMarkNotificationRead } from '../hooks/useMarkNotificationRead';
import { useMarkAllNotificationsRead } from '../hooks/useMarkAllNotificationsRead';
import { useVoteNotificationPoll } from '../hooks/useVoteNotificationPoll';
import { formatNotificationDate, isFailureNotification } from '../utils/notification-formatters';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'all' | 'unread'>('all');
  const query = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        description="Track learning updates, background jobs, and actions that need your attention."
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-(--border-subtle) bg-(--surface-card) p-1">
          {(['all', 'unread'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              aria-pressed={view === value}
              className={cn(
                'min-h-10 rounded-lg px-3 text-[12px] font-bold capitalize',
                view === value ? 'bg-(--brand-500) text-white' : 'text-(--text-secondary)'
              )}
            >
              {value}
              {value === 'unread' && query.data?.unreadCount ? ` (${query.data.unreadCount})` : ''}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!query.data?.unreadCount || markAll.isPending}
          onClick={() => markAll.mutate()}
          className="flex items-center gap-2 rounded-xl border border-(--border-subtle) px-3 py-2 text-xs font-bold text-(--text-secondary) disabled:opacity-50"
        >
          <CheckCheck size={15} /> Mark all as read
        </button>
      </div>
      <section className="overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-card)">
        {query.isLoading && (
          <div
            role="status"
            aria-label="Loading notifications"
            className="divide-y divide-(--border-subtle)"
          >
            <span className="sr-only">Loading notifications…</span>
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} aria-hidden="true" className="flex gap-4 p-5 max-[520px]:p-4">
                <SkeletonBlock className="h-11 w-11 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <SkeletonBlock className="h-4 w-2/5" />
                  <SkeletonBlock className="mt-2 h-3 w-4/5" />
                  <SkeletonBlock className="mt-2 h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        )}
        {query.isError && (
          <p className="p-8 text-center text-sm text-(--danger)">Unable to load notifications.</p>
        )}
        {(query.data?.notifications.filter((notification) => view === 'all' || !notification.isRead)
          .length ?? 0) === 0 && (
          <div className="p-12 text-center">
            <Bell className="mx-auto mb-3 text-(--text-secondary)" />
            <p className="font-bold">
              {view === 'unread' ? 'No unread notifications' : 'You’re all caught up'}
            </p>
          </div>
        )}
        {query.data?.notifications
          .filter((notification) => view === 'all' || !notification.isRead)
          .map((notification) => {
            const failed = isFailureNotification(notification.type);
            return (
              <div
                key={notification.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (!notification.isRead) markRead.mutate(notification.id);
                  if (notification.deepLink) navigate(notification.deepLink);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    if (!notification.isRead) markRead.mutate(notification.id);
                    if (notification.deepLink) navigate(notification.deepLink);
                  }
                }}
                className={cn(
                  'group flex w-full cursor-pointer items-start gap-4 border-b border-(--border-subtle) p-5 text-left last:border-b-0 hover:bg-(--surface-canvas)',
                  !notification.isRead && 'bg-[rgba(184,76,43,0.05)]'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 rounded-xl p-2',
                    failed
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-[rgba(184,76,43,0.10)] text-(--brand-500)'
                  )}
                >
                  {failed ? <CircleAlert size={18} /> : <Sparkles size={18} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-(--text-primary)">
                    {notification.message}
                  </span>
                  <span className="mt-1 block text-[12px] text-(--text-secondary)">
                    {formatNotificationDate(notification.createdAt)}
                  </span>
                  {notification.deepLink && (
                    <span className="mt-2 inline-flex text-[12px] font-bold text-(--brand-500) transition-transform group-hover:translate-x-0.5">
                      Open update →
                    </span>
                  )}
                  {isBroadcastPoll(notification.metadata) && (
                    <PollVoteControls
                      notificationId={notification.id}
                      poll={notification.metadata.poll}
                    />
                  )}
                </span>
                <button
                  type="button"
                  disabled={notification.isRead || markRead.isPending}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!notification.isRead) markRead.mutate(notification.id);
                  }}
                  className={cn(
                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition',
                    notification.isRead
                      ? 'border-transparent text-(--success)'
                      : 'border-(--border-subtle) text-(--text-muted) hover:border-(--brand-500) hover:text-(--brand-500)'
                  )}
                  aria-label={
                    notification.isRead ? 'Notification read' : 'Mark notification as read'
                  }
                  title={notification.isRead ? 'Read' : 'Mark as read'}
                >
                  <Check size={15} strokeWidth={notification.isRead ? 2.5 : 2} />
                </button>
              </div>
            );
          })}
      </section>
    </PageContainer>
  );
}

type NotificationPoll = { question: string; options: string[] };

function isBroadcastPoll(
  metadata: Record<string, unknown> | undefined
): metadata is { poll: NotificationPoll } {
  const poll = metadata?.poll as Partial<NotificationPoll> | undefined;
  return Boolean(poll?.question && Array.isArray(poll.options) && poll.options.length > 1);
}

function PollVoteControls({
  notificationId,
  poll,
}: {
  notificationId: string;
  poll: NotificationPoll;
}) {
  const vote = useVoteNotificationPoll();
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <span
      className="mt-4 block rounded-xl border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.05)] p-3"
      onClick={(event) => event.stopPropagation()}
    >
      <span className="block text-xs font-semibold text-(--text-primary)">{poll.question}</span>
      <span className="mt-2 grid gap-2">
        {poll.options.map((option, index) => (
          <button
            key={option}
            type="button"
            disabled={vote.isPending || selected !== null}
            onClick={() =>
              vote.mutate(
                { notificationId, optionIndex: index },
                { onSuccess: () => setSelected(index) }
              )
            }
            className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition disabled:cursor-default ${selected === index ? 'border-(--brand-500) bg-[rgba(184,76,43,0.12)] text-(--brand-500)' : 'border-(--border-subtle) hover:border-(--brand-500)'}`}
          >
            {selected === index ? 'Vote recorded · ' : ''}
            {option}
          </button>
        ))}
      </span>
    </span>
  );
}
