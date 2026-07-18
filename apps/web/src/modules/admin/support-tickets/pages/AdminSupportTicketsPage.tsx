import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye, MessageSquareText } from "lucide-react";
import {
  AdminCardSkeleton,
  AdminEmpty,
  AdminError,
  AdminTableSkeleton,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPaginationControls,
  AdminPanel,
  AdminSearch,
  AdminStatusBadge,
} from "../../../../components/admin";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import { getUserFacingError } from "../../../../lib/user-facing-error";
import { useAdminSupportTickets } from "../hooks/useAdminSupportTickets";
import { useUpdateAdminSupportTicket } from "../hooks/useUpdateAdminSupportTicket";
import Modal from "../../../../components/admin/AdminModal";
import type { AdminSupportTicket } from "../types/admin-support-tickets.types";
import AdminActionPasswordField from "../../../../components/admin/AdminActionPasswordField";
import { isAdminActionPasswordReady } from "../../../../lib/admin/admin-action-password";

const validStatuses = new Set([
  "all",
  "open",
  "in_progress",
  "resolved",
  "closed",
]);

export default function AdminSupportTicketsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [selected, setSelected] = useState<AdminSupportTicket | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);
  const requestedStatus = searchParams.get("status") || "all";
  const status = validStatuses.has(requestedStatus) ? requestedStatus : "all";
  const requestedPage = Number(searchParams.get("page") || 1);
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const updateParams = (updates: Record<string, string | number | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all" || value === 1)
        next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if ((searchParams.get("q") || "") === debouncedSearch) return;
    updateParams({ q: debouncedSearch || null, page: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data, isLoading, isPlaceholderData, isError, error, refetch } = useAdminSupportTickets({
    search: debouncedSearch,
    status,
    page,
  });
  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="Support Tickets"
        description="Review complete user requests, communicate progress, and update resolution status."
      />
      {isLoading ? (
        <div className="mt-7">
          <AdminCardSkeleton cards={5} label="Loading support ticket metrics" />
        </div>
      ) : (
        <AdminMetricGrid
          metrics={[
          { label: "All tickets", value: data?.pagination.total ?? 0 },
          { label: "Open", value: data?.stats?.open ?? 0, tone: "warning" },
          {
            label: "In progress",
            value: data?.stats?.inProgress ?? 0,
            tone: "info",
          },
          {
            label: "Resolved",
            value: data?.stats?.resolved ?? 0,
            tone: "success",
          },
          {
            label: "SLA overdue",
            value: data?.stats?.overdue ?? 0,
            tone: "error",
          },
        ]}
        />
      )}
      <AdminPanel
        title="Ticket queue"
        toolbar={
          <div className="flex flex-wrap gap-3">
            <select
              value={status}
              onChange={(e) =>
                updateParams({ status: e.target.value, page: null })
              }
              className="admin-select"
              aria-label="Filter support tickets by status"
            >
              <option value="all">All status</option>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <AdminSearch
              value={search}
              onChange={setSearch}
              placeholder="Search tickets or requesters…"
            />
          </div>
        }
      >
        {isLoading || isPlaceholderData ? (
          <div className="admin-table-scroll overflow-x-auto">
            <AdminTableSkeleton columns={7} rows={8} label="Loading support tickets" />
          </div>
        ) : isError ? (
          <AdminError error={error} onRetry={() => void refetch()} />
        ) : !data?.items.length ? (
          <AdminEmpty>No support tickets have been submitted.</AdminEmpty>
        ) : (
          <>
            <div className="admin-table-scroll overflow-x-auto">
              <table className="admin-table w-full min-w-212.5 text-left text-sm">
                <caption className="sr-only">Support ticket queue</caption>
                <thead>
                  <tr>
                    <th scope="col">Ticket</th>
                    <th scope="col">Requester</th>
                    <th scope="col">Category</th>
                    <th scope="col">Priority</th>
                    <th scope="col">Status</th>
                    <th scope="col">Assignee</th>
                    <th scope="col">Resolution SLA</th>
                    <th scope="col">Created</th>
                    <th scope="col">Action</th>
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
                      <td>{item.assignedTo}</td>
                      <td>
                        <AdminStatusBadge
                          value={item.isOverdue ? "overdue" : "on_track"}
                        />
                        <div className="mt-1 text-xs text-[#817c75]">
                          {new Date(item.resolutionDueAt).toLocaleString()}
                        </div>
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
            <AdminPaginationControls
              page={page}
              pages={data.pagination.pages}
              label="support tickets"
              onPageChange={(nextPage) => updateParams({ page: nextPage })}
            />
          </>
        )}
      </AdminPanel>
      {selected && (
        <TicketDetail
          key={selected.id}
          ticket={selected}
          close={() => setSelected(null)}
        />
      )}
    </main>
  );
}

function TicketDetail({
  ticket,
  close,
}: {
  ticket: AdminSupportTicket;
  close: () => void;
}) {
  const update = useUpdateAdminSupportTicket();
  const [status, setStatus] = useState(ticket.status);
  const [resolutionNote, setResolutionNote] = useState(
    ticket.resolutionNote || "",
  );
  const [notificationMessage, setNotificationMessage] = useState("");
  const [actionPassword, setActionPassword] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    update.mutate(
      { id: ticket.id, status, resolutionNote, notificationMessage, actionPassword },
      { onSuccess: close },
    );
  };

  const hasChanges =
    status !== ticket.status ||
    resolutionNote !== (ticket.resolutionNote || "") ||
    notificationMessage.trim().length > 0;

  return (
    <Modal
      open
      onClose={close}
      preventClose={update.isPending}
      ariaLabel={`Support ticket: ${ticket.subject}`}
      contentClassName="max-w-2xl bg-[#1c1a18] text-[#f2f0eb]"
    >
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#e8816a]">
          Support ticket
        </div>
        <h2 className="font-editorial mt-1 text-2xl font-bold">
          {ticket.subject}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <AdminStatusBadge value={ticket.priority} />
          <AdminStatusBadge value={ticket.status} />
          <AdminStatusBadge value={ticket.isOverdue ? "overdue" : "on_track"} />
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Requester" value={ticket.requester} />
          <Info label="Category" value={ticket.category} />
          <Info
            label="Submitted"
            value={new Date(ticket.createdAt).toLocaleString()}
          />
          <Info label="Assignee" value={ticket.assignedTo} />
          <Info
            label="First response"
            value={
              ticket.firstRespondedAt
                ? new Date(ticket.firstRespondedAt).toLocaleString()
                : `Due ${new Date(ticket.firstResponseDueAt).toLocaleString()}`
            }
          />
          <Info
            label="Resolution SLA"
            value={`${ticket.isOverdue ? "Overdue · " : "Due "}${new Date(ticket.resolutionDueAt).toLocaleString()}`}
          />
        </div>

        <section className="admin-dialog-section p-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#817c75]">
            User description
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#f2f0eb]">
            {ticket.description}
          </p>
        </section>

        <form
          onSubmit={submit}
          className="space-y-4 border-t border-white/10 pt-5"
        >
          <label className="admin-field">
            <span>Update status</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as AdminSupportTicket["status"])
              }
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
              onChange={(event) => setResolutionNote(event.target.value)}
              placeholder="Record investigation or resolution details for administrators."
            />
          </label>

          <label className="admin-field">
            <span className="flex items-center gap-2">
              <MessageSquareText size={14} aria-hidden="true" />
              Message to user
            </span>
            <textarea
              rows={4}
              maxLength={500}
              value={notificationMessage}
              onChange={(event) => setNotificationMessage(event.target.value)}
              placeholder={`Optional. If empty, the user receives: Your support ticket “${ticket.subject}” is now ${status.replace("_", " ")}.`}
            />
          </label>

          <p className="text-xs leading-5 text-[#817c75]">
            Saving sends an in-app notification to the requester with the new
            status and message.
          </p>
          <AdminActionPasswordField value={actionPassword} onChange={setActionPassword} />

          {update.isError && (
            <p
              className="rounded-lg border border-[#e26767]/25 bg-[#e26767]/10 p-3 text-sm text-[#e26767]"
              role="alert"
            >
              {getUserFacingError(
                update.error,
                "The ticket could not be updated or the notification could not be sent.",
              )}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={close} className="admin-button">
              Cancel
            </button>
            <button
              disabled={update.isPending || !hasChanges || !isAdminActionPasswordReady(actionPassword)}
              className="admin-primary-button"
            >
              {update.isPending ? "Updating…" : "Update and notify user"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-info-tile p-4">
      <div className="text-[10px] font-bold uppercase tracking-wide text-[#817c75]">
        {label}
      </div>
      <div className="mt-2 wrap-break-word text-sm font-semibold">{value}</div>
    </div>
  );
}
