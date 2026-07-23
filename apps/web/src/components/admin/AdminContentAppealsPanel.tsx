import { ExternalLink, Eye, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import Modal from './AdminModal';
import { useAdminContentAppeals } from '../../hooks/admin/useAdminContentAppeals';
import { useUpdateAdminContentAppeal } from '../../hooks/admin/useUpdateAdminContentAppeal';
import type {
  AdminContentAppeal,
  AdminContentAppealDecision,
} from '../../hooks/admin/admin-shared.types';
import {
  AdminCardSkeleton,
  AdminEmpty,
  AdminError,
  AdminTableSkeleton,
  AdminMetricGrid,
  AdminPaginationControls,
  AdminPanel,
  AdminStatusBadge,
} from './AdminPage';
import AdminActionPasswordField from './AdminActionPasswordField';
import { isAdminActionPasswordReady } from '../../lib/admin/admin-action-password';

type DecisionInput = Omit<AdminContentAppealDecision, 'id'>;

export function AdminContentAppealsPanel({ kind }: { kind: 'trackers' | 'mock-tests' }) {
  const [status, setStatus] = useState<'all' | AdminContentAppeal['status']>('pending');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminContentAppeal | null>(null);
  const query = useAdminContentAppeals(kind, status, page);
  const update = useUpdateAdminContentAppeal(kind);

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
              label: 'Appeals pending',
              value: data?.stats.pending ?? 0,
              tone: 'warning',
            },
            {
              label: 'Under review',
              value: data?.stats.underReview ?? 0,
              tone: 'info',
            },
            {
              label: 'Approved',
              value: data?.stats.approved ?? 0,
              tone: 'success',
            },
            {
              label: 'Rejected',
              value: data?.stats.rejected ?? 0,
              tone: 'error',
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
          <AdminError error={query.error} onRetry={() => void query.refetch()} />
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
                        <div className="text-xs text-[#817c75]">{item.moderationStatus}</div>
                      </td>
                      <td>
                        {item.ownerName}
                        <div className="text-xs text-[#817c75]">{item.ownerEmail}</div>
                      </td>
                      <td className="max-w-80 truncate" title={item.reason}>
                        {item.reason}
                      </td>
                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                      <td>
                        <AdminStatusBadge value={item.status} />
                      </td>
                      <td>{item.assignedTo || 'Unassigned'}</td>
                      <td>
                        <button className="admin-button" onClick={() => setSelected(item)}>
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
        key={selected?.id ?? 'closed'}
        appeal={selected}
        pending={update.isPending}
        onClose={() => setSelected(null)}
        onSubmit={(payload) =>
          selected &&
          update.mutate({ id: selected.id, ...payload }, { onSuccess: () => setSelected(null) })
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
  appeal: AdminContentAppeal | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (input: DecisionInput) => void;
}) {
  const [decisionStatus, setDecisionStatus] =
    useState<DecisionInput['decisionStatus']>('under_review');
  const [decisionNote, setDecisionNote] = useState('');
  const [actionPassword, setActionPassword] = useState('');
  const ready = decisionNote.trim().length >= 10 && isAdminActionPasswordReady(actionPassword);

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
              <a key={url} className="admin-button" href={url} target="_blank" rel="noreferrer">
                <ExternalLink size={14} aria-hidden="true" /> Evidence {index + 1}
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
            setDecisionStatus(event.target.value as DecisionInput['decisionStatus'])
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
      <AdminActionPasswordField
        value={actionPassword}
        onChange={setActionPassword}
        className="admin-field mt-4"
      />

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
              actionPassword,
            })
          }
        >
          {pending ? 'Saving…' : 'Save decision'}
        </button>
      </div>
    </Modal>
  );
}
