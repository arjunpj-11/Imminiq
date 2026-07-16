import { useState } from 'react';
import { ArrowLeft, Eye, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../../../../components/overlays/Modal';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPanel,
  AdminSearch,
  AdminStatusBadge,
} from '../../shared';
import { ADMIN_USERS_ROUTES } from '../constants/admin-users.constants';
import { useAdminUserAppeals } from '../hooks/useAdminUserAppeals';
import { useUpdateAdminUserAppeal } from '../hooks/useUpdateAdminUserAppeal';
import type {
  AdminUserAppeal,
  AdminUserAppealUpdatePayload,
} from '../types/admin-users.types';
import { AdminPrivacyRequestsPanel } from '../components/AdminPrivacyRequestsPanel';

export default function AdminUserAppealsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | AdminUserAppeal['status']>('pending');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminUserAppeal | null>(null);
  const query = useAdminUserAppeals({ search: useDebouncedValue(search, 300), status, page });
  const data = query.data;

  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <Link to={ADMIN_USERS_ROUTES.list} className="mb-5 inline-flex items-center gap-2 text-sm text-[#aaa59d] hover:text-[#e8816a]">
        <ArrowLeft size={16} /> Back to user management
      </Link>
      <AdminPageHeader
        title="Account Appeals"
        description="Claim, investigate, and decide restricted-account appeals with a complete review record."
      />
      <AdminMetricGrid
        metrics={[
          { label: 'Pending', value: data?.stats.pending ?? 0, tone: 'error' },
          { label: 'Under review', value: data?.stats.underReview ?? 0, tone: 'warning' },
          { label: 'Approved', value: data?.stats.approved ?? 0, tone: 'success' },
          { label: 'Rejected', value: data?.stats.rejected ?? 0, tone: 'info' },
        ]}
      />
      <AdminPanel
        title="Appeal queue"
        toolbar={
          <div className="flex flex-wrap gap-3">
            <select
              className="admin-select"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as typeof status);
                setPage(1);
              }}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <AdminSearch
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search case, user, or reason…"
            />
          </div>
        }
      >
        {query.isLoading ? (
          <AdminLoading />
        ) : query.isError ? (
          <AdminError error={query.error} />
        ) : !data?.items.length ? (
          <AdminEmpty>No appeals match this view.</AdminEmpty>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="admin-table w-full min-w-250 text-left text-sm">
                <thead><tr><th>Case</th><th>User</th><th>Submitted</th><th>Restriction reason</th><th>Status</th><th>Reviewer</th><th>Action</th></tr></thead>
                <tbody>
                  {data.items.map((appeal) => (
                    <tr key={appeal.id}>
                      <td><div className="font-mono font-semibold">{appeal.caseId}</div><div className="max-w-70 truncate text-xs text-[#817c75]">{appeal.appealReason}</div></td>
                      <td><Link className="font-semibold text-[#e8816a]" to={ADMIN_USERS_ROUTES.detail(appeal.userId)}>{appeal.userName}</Link><div className="text-xs text-[#817c75]">{appeal.identifier}</div></td>
                      <td>{new Date(appeal.createdAt).toLocaleString()}</td>
                      <td className="max-w-70 truncate">{appeal.originalReason || 'No stored explanation'}</td>
                      <td><AdminStatusBadge value={appeal.status} /></td>
                      <td>{appeal.reviewedBy || '—'}</td>
                      <td><button className="admin-button inline-flex items-center gap-2" onClick={() => setSelected(appeal)}><Eye size={14} /> {appeal.status === 'pending' ? 'Claim' : 'Review'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 p-4">
              <button className="admin-button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span className="px-3 py-2 text-xs text-[#aaa59d]">{page} / {data.pagination.pages}</span>
              <button className="admin-button" disabled={page >= data.pagination.pages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </>
        )}
      </AdminPanel>
      <AppealDecisionDialog key={selected?.id ?? 'closed'} appeal={selected} onClose={() => setSelected(null)} />
      <AdminPrivacyRequestsPanel />
    </main>
  );
}

function AppealDecisionDialog({ appeal, onClose }: { appeal: AdminUserAppeal | null; onClose: () => void }) {
  const update = useUpdateAdminUserAppeal();
  const [status, setStatus] = useState<AdminUserAppealUpdatePayload['status']>(
    appeal?.status === 'pending' ? 'under_review' : 'approved'
  );
  const [reviewNote, setReviewNote] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [mfaCode, setMfaCode] = useState('');
  const submit = () => {
    if (!appeal || reviewNote.trim().length < 10) return;
    update.mutate(
      { id: appeal.id, payload: { status, reviewNote: reviewNote.trim(), notifyEmail, mfaCode: mfaCode.trim() } },
      { onSuccess: onClose }
    );
  };
  return (
    <Modal open={Boolean(appeal)} onClose={onClose} preventClose={update.isPending} ariaLabel="Review account appeal" contentClassName="max-w-2xl bg-[#1c1a18] text-[#f2f0eb]">
      <div className="flex gap-3"><ShieldCheck className="text-[#e8816a]" /><div><h2 className="font-editorial text-2xl font-bold">Appeal {appeal?.caseId}</h2><p className="text-sm text-[#aaa59d]">{appeal?.userName}</p></div></div>
      <section className="mt-5 space-y-4 rounded-xl border border-white/10 bg-[#24211e] p-5 text-sm leading-6">
        <div><strong>Original restriction:</strong> {appeal?.originalReason || 'No stored explanation'}</div>
        <div><strong>User appeal:</strong> {appeal?.appealReason}</div>
      </section>
      <label className="admin-field mt-5 block"><span>Decision</span><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="under_review">Claim and start review</option><option value="approved">Approve and restore account</option><option value="rejected">Reject appeal</option></select></label>
      <label className="admin-field mt-4 block"><span>User-facing review note</span><textarea rows={5} maxLength={2000} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Explain the review and the next step…" /></label>
      <label className="mt-4 flex items-center gap-3 text-sm text-[#aaa59d]"><input type="checkbox" checked={notifyEmail} onChange={(event) => setNotifyEmail(event.target.checked)} /> Also send the decision by email</label>
      <label className="admin-field mt-4 block"><span>Authenticator code</span><input inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={mfaCode} onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, ''))} placeholder="Required in production" /></label>
      <div className="mt-6 flex justify-end gap-2"><button className="admin-button" onClick={onClose}>Cancel</button><button className="admin-primary-button" disabled={reviewNote.trim().length < 10 || update.isPending} onClick={submit}>{update.isPending ? 'Saving…' : 'Save decision'}</button></div>
    </Modal>
  );
}
