import { useState } from "react";
import { Eye, ShieldCheck } from "lucide-react";
import Modal from "../../shared/components/AdminModal";
import {
  AdminCardSkeleton,
  AdminEmpty,
  AdminError,
  AdminTableSkeleton,
  AdminMetricGrid,
  AdminPaginationControls,
  AdminPanel,
  AdminStatusBadge,
} from "../../shared";
import { useAdminPrivacyRequests } from "../hooks/useAdminPrivacyRequests";
import { useUpdateAdminPrivacyRequest } from "../hooks/useUpdateAdminPrivacyRequest";
import type { AdminPrivacyRequest } from "../types/admin-users.types";

export function AdminPrivacyRequestsPanel() {
  const [status, setStatus] = useState<"all" | AdminPrivacyRequest["status"]>(
    "pending",
  );
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminPrivacyRequest | null>(null);
  const query = useAdminPrivacyRequests({ status, type: "all", page });
  const data = query.data;
  return (
    <section className="mt-8">
      {query.isLoading ? (
        <div className="mt-7">
          <AdminCardSkeleton cards={4} label="Loading privacy request metrics" />
        </div>
      ) : (
        <AdminMetricGrid
          metrics={[
          {
            label: "Privacy pending",
            value: data?.stats.pending ?? 0,
            tone: "warning",
          },
          {
            label: "In progress",
            value: data?.stats.inProgress ?? 0,
            tone: "info",
          },
          {
            label: "Completed",
            value: data?.stats.completed ?? 0,
            tone: "success",
          },
          {
            label: "Overdue SLA",
            value: data?.stats.overdue ?? 0,
            tone: "error",
          },
        ]}
        />
      )}
      <AdminPanel
        title="Data-rights request queue"
        toolbar={
          <select
            className="admin-select"
            aria-label="Filter privacy requests by status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as typeof status);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        }
      >
        {query.isLoading || query.isPlaceholderData ? (
          <div className="admin-table-scroll overflow-x-auto">
            <AdminTableSkeleton columns={7} rows={7} label="Loading privacy requests" />
          </div>
        ) : query.isError ? (
          <AdminError
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        ) : !data?.items.length ? (
          <AdminEmpty>No data-rights requests match this view.</AdminEmpty>
        ) : (
          <>
            <div className="admin-table-scroll overflow-x-auto">
              <table className="admin-table w-full min-w-220 text-left text-sm">
                <caption className="sr-only">
                  User data-rights request queue
                </caption>
                <thead>
                  <tr>
                    <th scope="col">User</th>
                    <th scope="col">Type</th>
                    <th scope="col">Submitted</th>
                    <th scope="col">SLA due</th>
                    <th scope="col">Status</th>
                    <th scope="col">Owner</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.userName}</strong>
                        <div className="text-xs text-[#817c75]">
                          {item.identifier}
                        </div>
                      </td>
                      <td className="capitalize">{item.type}</td>
                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                      <td
                        className={
                          new Date(item.dueAt) < new Date() &&
                          !["completed", "rejected", "cancelled"].includes(
                            item.status,
                          )
                            ? "text-[#e26767]"
                            : ""
                        }
                      >
                        {new Date(item.dueAt).toLocaleDateString()}
                      </td>
                      <td>
                        <AdminStatusBadge value={item.status} />
                      </td>
                      <td>{item.assignedTo || "Unassigned"}</td>
                      <td>
                        <button
                          className="admin-button inline-flex items-center gap-2"
                          onClick={() => setSelected(item)}
                        >
                          <Eye size={14} /> Review
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
              label="privacy requests"
              onPageChange={setPage}
            />
          </>
        )}
      </AdminPanel>
      <PrivacyDecisionDialog
        key={selected?.id ?? "closed"}
        request={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}

function PrivacyDecisionDialog({
  request,
  onClose,
}: {
  request: AdminPrivacyRequest | null;
  onClose: () => void;
}) {
  const update = useUpdateAdminPrivacyRequest();
  const [status, setStatus] = useState<
    "in_progress" | "completed" | "rejected"
  >("in_progress");
  const [resolutionNote, setResolutionNote] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  return (
    <Modal
      open={Boolean(request)}
      onClose={onClose}
      preventClose={update.isPending}
      ariaLabel="Review privacy request"
      contentClassName="max-w-2xl bg-[#1c1a18] text-[#f2f0eb]"
    >
      <div className="flex gap-3">
        <ShieldCheck className="text-[#e8816a]" />
        <div>
          <h2 className="font-editorial text-2xl font-bold capitalize">
            {request?.type} request
          </h2>
          <p className="text-sm text-[#aaa59d]">
            {request?.userName} · due{" "}
            {request && new Date(request.dueAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-white/10 bg-[#24211e] p-5 text-sm">
        {request?.details}
      </div>
      <label className="admin-field mt-4 block">
        <span>Workflow state</span>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
        >
          <option value="in_progress">Claim / in progress</option>
          <option value="completed">Complete</option>
          <option value="rejected">Reject</option>
        </select>
      </label>
      {request?.type === "export" && (
        <label className="admin-field mt-4 block">
          <span>Secure export URL (optional until completed)</span>
          <input
            type="url"
            value={downloadUrl}
            onChange={(event) => setDownloadUrl(event.target.value)}
          />
        </label>
      )}
      <label className="admin-field mt-4 block">
        <span>User-facing resolution note</span>
        <textarea
          rows={5}
          maxLength={3000}
          value={resolutionNote}
          onChange={(event) => setResolutionNote(event.target.value)}
        />
      </label>
      <label className="admin-field mt-4 block">
        <span>6-digit authenticator code</span>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={mfaCode}
          onChange={(event) =>
            setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
        />
      </label>
      <div className="mt-6 flex justify-end gap-2">
        <button className="admin-button" onClick={onClose}>
          Cancel
        </button>
        <button
          className="admin-primary-button"
          disabled={
            resolutionNote.trim().length < 10 ||
            mfaCode.length !== 6 ||
            update.isPending
          }
          onClick={() =>
            request &&
            update.mutate(
              {
                id: request.id,
                status,
                resolutionNote: resolutionNote.trim(),
                downloadUrl,
                mfaCode,
              },
              { onSuccess: onClose },
            )
          }
        >
          {update.isPending ? "Saving…" : "Save workflow"}
        </button>
      </div>
    </Modal>
  );
}
