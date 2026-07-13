import { useState, type FormEvent } from 'react';
import { Eye, MessageSquareText, X } from 'lucide-react';
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPanel,
  AdminSearch,
  AdminStatusBadge,
} from '../../../../components/admin/AdminPage';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import {
  useAdminSupportTickets,
  useUpdateAdminSupportTicket,
} from '../hooks/useAdminSupportTickets';
import type { AdminSupportTicket } from '../types/admin-support-tickets.types';

export default function AdminSupportTicketsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminSupportTicket | null>(null);
  const { data, isLoading, isError } = useAdminSupportTickets({
    search: useDebouncedValue(search, 300),
    status,
    page,
  });
  return (
    <main className="mx-auto max-w-[1240px] px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="Support Tickets"
        description="Review complete user requests, communicate progress, and update resolution status."
      />
      <AdminMetricGrid
        metrics={[
          { label: 'All tickets', value: data?.pagination.total ?? 0 },
          { label: 'Open', value: data?.stats?.open ?? 0, tone: 'warning' },
          { label: 'In progress', value: data?.stats?.inProgress ?? 0, tone: 'info' },
          { label: 'Resolved', value: data?.stats?.resolved ?? 0, tone: 'success' },
        ]}
      />
      <AdminPanel
        title="Ticket queue"
        toolbar={
          <div className="flex flex-wrap gap-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="admin-select"
            >
              <option value="all">All status</option>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <AdminSearch
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />
          </div>
        }
      >
        {isLoading ? (
          <AdminLoading />
        ) : isError ? (
          <AdminError />
        ) : !data?.items.length ? (
          <AdminEmpty>No support tickets have been submitted.</AdminEmpty>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="admin-table w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Requester</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td className="font-semibold">{item.subject}</td>
                      <td>{item.requester}</td>
                      <td>{item.category}</td>
                      <td>
                        <AdminStatusBadge value={item.priority} />
                      </td>
                      <td>
                        <AdminStatusBadge value={item.status} />
                      </td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => setSelected(item)}
                          className="admin-button inline-flex items-center gap-2"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 p-4">
              <button
                className="admin-button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span className="px-3 py-2 text-xs text-[#aaa59d]">
                {page} / {data.pagination.pages}
              </span>
              <button
                className="admin-button"
                disabled={page >= data.pagination.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </AdminPanel>
      {selected && (
        <TicketDetail key={selected.id} ticket={selected} close={() => setSelected(null)} />
      )}
    </main>
  );
}

function TicketDetail({ ticket, close }: { ticket: AdminSupportTicket; close: () => void }) {
  const update = useUpdateAdminSupportTicket();
  const [status, setStatus] = useState(ticket.status);
  const [resolutionNote, setResolutionNote] = useState(ticket.resolutionNote || '');
  const [notificationMessage, setNotificationMessage] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    update.mutate(
      { id: ticket.id, status, resolutionNote, notificationMessage },
      { onSuccess: close }
    );
  };
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-[#1c1a18] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-white/10 bg-[#1c1a18] p-5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#e8816a]">
              Support ticket
            </div>
            <h2 className="mt-1 text-xl font-bold">{ticket.subject}</h2>
            <div className="mt-2 flex gap-2">
              <AdminStatusBadge value={ticket.priority} />
              <AdminStatusBadge value={ticket.status} />
            </div>
          </div>
          <button onClick={close} className="admin-icon-button">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-5 p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <Info label="Requester" value={ticket.requester} />
            <Info label="Category" value={ticket.category} />
            <Info label="Submitted" value={new Date(ticket.createdAt).toLocaleString()} />
          </div>
          <section className="rounded-xl border border-white/10 bg-[#24211e] p-5">
            <div className="text-[10px] uppercase tracking-wider text-[#817c75]">
              User description
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#f2f0eb]">
              {ticket.description}
            </p>
          </section>
          <form onSubmit={submit} className="space-y-4 border-t border-white/10 pt-5">
            <label className="admin-field">
              <span>Update status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AdminSupportTicket['status'])}
              >
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Internal resolution note</span>
              <textarea
                rows={3}
                maxLength={2000}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Record investigation or resolution details for administrators."
              />
            </label>
            <label className="admin-field">
              <span className="flex items-center gap-2">
                <MessageSquareText size={14} />
                Message to user
              </span>
              <textarea
                rows={4}
                maxLength={500}
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder={`Optional. If empty, the user receives: Your support ticket “${ticket.subject}” is now ${status.replace('_', ' ')}.`}
              />
            </label>
            <p className="text-xs text-[#817c75]">
              Saving sends an in-app notification to the requester with the new status and this
              message.
            </p>
            {update.isError && (
              <p className="text-sm text-[#e26767]">
                The ticket could not be updated or the notification could not be sent.
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={close} className="admin-button">
                Cancel
              </button>
              <button disabled={update.isPending} className="admin-primary-button">
                {update.isPending ? 'Updating…' : 'Update and notify user'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#24211e] p-4">
      <div className="text-[10px] uppercase text-[#817c75]">{label}</div>
      <div className="mt-2 break-words text-sm font-semibold">{value}</div>
    </div>
  );
}
