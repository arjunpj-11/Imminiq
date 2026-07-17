import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Eye, ShieldCheck } from "lucide-react";
import { useState } from "react";
import Modal from "./AdminModal";
import api from "../../../../lib/axios";
import type { ApiEnvelope } from "../../../../lib/api.types";
import { toast } from "../../../../lib/toast";
import { getUserFacingError } from "../../../../lib/user-facing-error";
import { ADMIN_CONTENT_APPEALS_ENDPOINTS } from "../constants/admin-shared.constants";
import {
  AdminCardSkeleton,
  AdminEmpty,
  AdminError,
  AdminTableSkeleton,
  AdminMetricGrid,
  AdminPaginationControls,
  AdminPanel,
  AdminStatusBadge,
} from "./AdminPage";

type Appeal = {
  id: string;
  title: string;
  moderationStatus: string;
  ownerName: string;
  ownerEmail?: string;
  reason: string;
  evidenceUrls: string[];
  status: "pending" | "under_review" | "approved" | "rejected";
  assignedTo?: string;
  createdAt: string;
};

type Data = {
  items: Appeal[];
  stats: {
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
  };
  pagination: { page: number; pages: number };
};

type DecisionInput = {
  decisionStatus: "under_review" | "approved" | "rejected";
  decisionNote: string;
  mfaCode: string;
};

export function AdminContentAppealsPanel({
  kind,
}: {
  kind: "trackers" | "mock-tests";
}) {
  const [status, setStatus] = useState<"all" | Appeal["status"]>("pending");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Appeal | null>(null);
  const base = ADMIN_CONTENT_APPEALS_ENDPOINTS.list(kind);
  const key = ["admin", kind, "content-appeals"] as const;
  const client = useQueryClient();

  const query = useQuery({
    queryKey: [...key, { status, page }],
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<Data>>(base, {
          params: { status, page },
        })
      ).data.data,
    placeholderData: keepPreviousData,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      decisionStatus,
      decisionNote,
      mfaCode,
    }: DecisionInput & { id: string }) =>
      api.patch(
        ADMIN_CONTENT_APPEALS_ENDPOINTS.detail(kind, id),
        { status: decisionStatus, decisionNote },
        { headers: { "X-Admin-MFA-Code": mfaCode } },
      ),
    onSuccess: async () => {
      toast.success("Content appeal updated");
      setSelected(null);
      await client.invalidateQueries({ queryKey: key });
    },
    onError: (error) =>
      toast.error("Appeal update failed", getUserFacingError(error)),
  });

  const data = query.data;

  return (
    <section className="mt-8">
      {query.isLoading ? (
        <div className="mt-7">
          <AdminCardSkeleton cards={4} label="Loading content appeal metrics" />
        </div>
      ) : (
        <AdminMetricGrid
          metrics={[
          {
            label: "Appeals pending",
            value: data?.stats.pending ?? 0,
            tone: "warning",
          },
          {
            label: "Under review",
            value: data?.stats.underReview ?? 0,
            tone: "info",
          },
          {
            label: "Approved",
            value: data?.stats.approved ?? 0,
            tone: "success",
          },
          {
            label: "Rejected",
            value: data?.stats.rejected ?? 0,
            tone: "error",
          },
        ]}
        />
      )}

      <AdminPanel
        title="Owner appeal queue"
        toolbar={
          <select
            className="admin-select"
            value={status}
            aria-label="Filter owner appeals by status"
            onChange={(event) => {
              setStatus(event.target.value as typeof status);
              setPage(1);
            }}
          >
            <option value="all">All appeals</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        }
      >
        {query.isLoading || query.isPlaceholderData ? (
          <div className="admin-table-scroll overflow-x-auto">
            <AdminTableSkeleton columns={7} rows={7} label="Loading content appeals" />
          </div>
        ) : query.isError ? (
          <AdminError
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        ) : !data?.items.length ? (
          <AdminEmpty>No owner appeals match this view.</AdminEmpty>
        ) : (
          <>
            <div className="admin-table-scroll overflow-x-auto">
              <table className="admin-table w-full min-w-220 text-left text-sm">
                <caption className="sr-only">
                  Content owner appeals matching the current status
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Content</th>
                    <th scope="col">Owner</th>
                    <th scope="col">Reason</th>
                    <th scope="col">Submitted</th>
                    <th scope="col">Status</th>
                    <th scope="col">Reviewer</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.title}</strong>
                        <div className="text-xs text-[#817c75]">
                          {item.moderationStatus}
                        </div>
                      </td>
                      <td>
                        {item.ownerName}
                        <div className="text-xs text-[#817c75]">
                          {item.ownerEmail}
                        </div>
                      </td>
                      <td className="max-w-80 truncate" title={item.reason}>
                        {item.reason}
                      </td>
                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                      <td>
                        <AdminStatusBadge value={item.status} />
                      </td>
                      <td>{item.assignedTo || "Unassigned"}</td>
                      <td>
                        <button
                          className="admin-button"
                          onClick={() => setSelected(item)}
                        >
                          <Eye size={14} aria-hidden="true" /> Review
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
              label="content appeals"
              onPageChange={setPage}
            />
          </>
        )}
      </AdminPanel>

      <DecisionDialog
        key={selected?.id ?? "closed"}
        appeal={selected}
        pending={update.isPending}
        onClose={() => setSelected(null)}
        onSubmit={(payload) =>
          selected && update.mutate({ id: selected.id, ...payload })
        }
      />
    </section>
  );
}

function DecisionDialog({
  appeal,
  pending,
  onClose,
  onSubmit,
}: {
  appeal: Appeal | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (input: DecisionInput) => void;
}) {
  const [decisionStatus, setDecisionStatus] =
    useState<DecisionInput["decisionStatus"]>("under_review");
  const [decisionNote, setDecisionNote] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const ready = decisionNote.trim().length >= 10 && /^\d{6}$/.test(mfaCode);

  return (
    <Modal
      open={Boolean(appeal)}
      onClose={onClose}
      preventClose={pending}
      ariaLabel="Review content appeal"
      contentClassName="max-w-2xl bg-[#1c1a18] text-[#f2f0eb]"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e8816a]/12 text-[#e8816a]">
          <ShieldCheck size={20} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-editorial text-2xl font-bold">Owner appeal</h2>
          <p className="mt-1 text-sm text-[#aaa59d]">
            {appeal?.title} · {appeal?.ownerName}
          </p>
        </div>
      </div>

      <div className="admin-dialog-section mt-5 p-5 text-sm leading-6">
        <p className="whitespace-pre-wrap">{appeal?.reason}</p>
        {appeal?.evidenceUrls.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {appeal.evidenceUrls.map((url, index) => (
              <a
                key={url}
                className="admin-button"
                href={url}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={14} aria-hidden="true" /> Evidence{" "}
                {index + 1}
              </a>
            ))}
          </div>
        ) : null}
      </div>

      <label className="admin-field mt-4">
        <span>Decision</span>
        <select
          value={decisionStatus}
          onChange={(event) =>
            setDecisionStatus(
              event.target.value as DecisionInput["decisionStatus"],
            )
          }
        >
          <option value="under_review">Claim and investigate</option>
          <option value="approved">Approve and restore content</option>
          <option value="rejected">Reject appeal</option>
        </select>
      </label>
      <label className="admin-field mt-4">
        <span>User-facing decision note</span>
        <textarea
          rows={5}
          value={decisionNote}
          onChange={(event) => setDecisionNote(event.target.value)}
          maxLength={3000}
          placeholder="Explain the decision and any next step."
        />
      </label>
      <label className="admin-field mt-4">
        <span>6-digit authenticator code</span>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={mfaCode}
          onChange={(event) =>
            setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="000000"
        />
      </label>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button type="button" className="admin-button" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="admin-primary-button"
          disabled={!ready || pending}
          onClick={() =>
            onSubmit({
              decisionStatus,
              decisionNote: decisionNote.trim(),
              mfaCode,
            })
          }
        >
          {pending ? "Saving…" : "Save decision"}
        </button>
      </div>
    </Modal>
  );
}
