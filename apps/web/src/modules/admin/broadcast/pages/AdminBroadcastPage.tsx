import { useState, type FormEvent } from 'react';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '../../shared';
import { useAdminBroadcasts } from '../hooks/useAdminBroadcasts';
import { useCreateAdminBroadcast } from '../hooks/useCreateAdminBroadcast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import ConfirmDialog from '../../../../components/overlays/ConfirmDialog';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import { AdminSearch } from '../../shared';

export default function AdminBroadcastPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data, isLoading, isError, isFetching, error } = useAdminBroadcasts(
    page,
    useDebouncedValue(search, 300)
  );
  const create = useCreateAdminBroadcast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<'all' | 'active'>('all');
  const [deepLink, setDeepLink] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setConfirmOpen(true);
  };
  const send = () => {
    create.mutate(
      { title, message, audience, deepLink: deepLink.trim() || undefined },
      {
        onSuccess: () => {
          setTitle('');
          setMessage('');
          setDeepLink('');
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
          { label: 'Total deliveries', value: data?.stats?.recipients ?? 0, tone: 'success' },
        ]}
      />
      <div className="grid items-start gap-7 xl:grid-cols-[minmax(320px,.8fr)_minmax(0,1.2fr)]">
        <AdminPanel title="Compose broadcast">
          <form onSubmit={submit} className="flex flex-col gap-4 p-6">
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
            <label className="admin-field">
              <span>Audience</span>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as typeof audience)}
              >
                <option value="all">All registered users</option>
                <option value="active">Active in last 30 days</option>
              </select>
            </label>
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
            <div className="flex justify-end border-t border-white/10 pt-4">
              <button
                disabled={create.isPending}
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
          {isLoading ? (
            <AdminLoading />
          ) : isError ? (
            <AdminError error={error} />
          ) : !data?.items.length ? (
            <AdminEmpty>No broadcasts have been sent.</AdminEmpty>
          ) : (
            <>
              <div
                className={`divide-y divide-white/10 transition-opacity ${isFetching ? 'opacity-60' : ''}`}
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
                      <span className="capitalize">{item.audience}</span>
                      <span>·</span>
                      <span>{new Date(item.sentAt).toLocaleString()}</span>
                      {item.deepLink && (
                        <>
                          <span>·</span>
                          <span>{item.deepLink}</span>
                        </>
                      )}
                    </div>
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
        description={`This immediately creates an in-app notification for ${audience === 'all' ? 'all eligible registered users' : 'eligible users active in the last 30 days'}. This cannot be recalled.`}
        confirmText="Send now"
        isLoading={create.isPending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={send}
      />
    </main>
  );
}
