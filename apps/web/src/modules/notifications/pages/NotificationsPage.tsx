import { Bell, CheckCheck, CircleAlert, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../../components/layout/PageContainer'
import PageHeader from '../../../components/layout/PageHeader'
import { cn } from '../../../lib/cn'
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../hooks/useNotifications'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const query = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  return (
    <PageContainer>
      <PageHeader title="Notifications" description="Background jobs and important updates." />
      <div className="mb-4 flex justify-end">
        <button type="button" disabled={!query.data?.unreadCount || markAll.isPending} onClick={() => markAll.mutate()} className="flex items-center gap-2 rounded-xl border border-(--border-subtle) px-3 py-2 text-xs font-bold text-(--text-secondary) disabled:opacity-50">
          <CheckCheck size={15} /> Mark all as read
        </button>
      </div>
      <section className="overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-card)">
        {query.isLoading && <p className="p-8 text-center text-sm text-(--text-secondary)">Loading notifications…</p>}
        {query.isError && <p className="p-8 text-center text-sm text-(--danger)">Unable to load notifications.</p>}
        {query.data?.notifications.length === 0 && <div className="p-12 text-center"><Bell className="mx-auto mb-3 text-(--text-secondary)" /><p className="font-bold">You’re all caught up</p></div>}
        {query.data?.notifications.map((notification) => {
          const failed = notification.type.endsWith('_failed')
          return (
            <button key={notification._id} type="button" onClick={() => {
              if (!notification.isRead) markRead.mutate(notification._id)
              if (notification.deepLink) navigate(notification.deepLink)
            }} className={cn('flex w-full items-start gap-4 border-b border-(--border-subtle) p-5 text-left last:border-b-0 hover:bg-(--surface-canvas)', !notification.isRead && 'bg-[rgba(184,76,43,0.05)]')}>
              <span className={cn('mt-0.5 rounded-xl p-2', failed ? 'bg-red-500/10 text-red-500' : 'bg-[rgba(184,76,43,0.10)] text-(--brand-500)')}>
                {failed ? <CircleAlert size={18} /> : <Sparkles size={18} />}
              </span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-(--text-primary)">{notification.message}</span><span className="mt-1 block text-[11px] text-(--text-secondary)">{new Date(notification.createdAt).toLocaleString()}</span></span>
              {!notification.isRead && <span className="mt-2 h-2 w-2 rounded-full bg-(--brand-500)" aria-label="Unread" />}
            </button>
          )
        })}
      </section>
    </PageContainer>
  )
}
