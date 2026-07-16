import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, ShieldCheck } from 'lucide-react';
import Modal from '../../../../components/overlays/Modal';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../../../lib/api.types';
import { toast } from '../../../../lib/toast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { AdminEmpty, AdminError, AdminLoading, AdminMetricGrid, AdminPanel, AdminStatusBadge } from './AdminPage';
import { ADMIN_CONTENT_APPEALS_ENDPOINTS } from '../constants/admin-shared.constants';

type Appeal = { id: string; title: string; moderationStatus: string; ownerName: string; ownerEmail?: string; reason: string; evidenceUrls: string[]; status: 'pending' | 'under_review' | 'approved' | 'rejected'; assignedTo?: string; createdAt: string };
type Data = { items: Appeal[]; stats: { pending: number; underReview: number; approved: number; rejected: number }; pagination: { page: number; pages: number } };

export function AdminContentAppealsPanel({ kind }: { kind: 'trackers' | 'mock-tests' }) {
  const [status, setStatus] = useState<'all' | Appeal['status']>('pending');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Appeal | null>(null);
  const base = ADMIN_CONTENT_APPEALS_ENDPOINTS.list(kind);
  const key = ['admin', kind, 'content-appeals'] as const;
  const query = useQuery({ queryKey: [...key, { status, page }], queryFn: async () => (await api.get<ApiEnvelope<Data>>(base, { params: { status, page } })).data.data });
  const client = useQueryClient();
  const update = useMutation({
    mutationFn: ({ id, decisionStatus, decisionNote, mfaCode }: { id: string; decisionStatus: 'under_review' | 'approved' | 'rejected'; decisionNote: string; mfaCode: string }) => api.patch(ADMIN_CONTENT_APPEALS_ENDPOINTS.detail(kind, id), { status: decisionStatus, decisionNote }, { headers: mfaCode ? { 'X-Admin-MFA-Code': mfaCode } : undefined }),
    onSuccess: async () => { toast.success('Content appeal updated'); setSelected(null); await client.invalidateQueries({ queryKey: key }); },
    onError: (error) => toast.error('Appeal update failed', getUserFacingError(error)),
  });
  const data = query.data;
  return <section className="mt-8"><AdminMetricGrid metrics={[{ label: 'Appeals pending', value: data?.stats.pending ?? 0, tone: 'warning' }, { label: 'Under review', value: data?.stats.underReview ?? 0, tone: 'info' }, { label: 'Approved', value: data?.stats.approved ?? 0, tone: 'success' }, { label: 'Rejected', value: data?.stats.rejected ?? 0, tone: 'error' }]}/><AdminPanel title="Owner appeal queue" toolbar={<select className="admin-select" value={status} onChange={(event) => { setStatus(event.target.value as typeof status); setPage(1); }}><option value="all">All appeals</option><option value="pending">Pending</option><option value="under_review">Under review</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>}>{query.isLoading ? <AdminLoading/> : query.isError ? <AdminError error={query.error}/> : !data?.items.length ? <AdminEmpty>No owner appeals match this view.</AdminEmpty> : <><div className="overflow-x-auto"><table className="admin-table w-full min-w-220 text-left text-sm"><thead><tr><th>Content</th><th>Owner</th><th>Reason</th><th>Submitted</th><th>Status</th><th>Reviewer</th><th>Action</th></tr></thead><tbody>{data.items.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><div className="text-xs text-[#817c75]">{item.moderationStatus}</div></td><td>{item.ownerName}<div className="text-xs text-[#817c75]">{item.ownerEmail}</div></td><td className="max-w-80 truncate">{item.reason}</td><td>{new Date(item.createdAt).toLocaleString()}</td><td><AdminStatusBadge value={item.status}/></td><td>{item.assignedTo || 'Unassigned'}</td><td><button className="admin-button inline-flex items-center gap-2" onClick={() => setSelected(item)}><Eye size={14}/> Review</button></td></tr>)}</tbody></table></div><div className="flex justify-end gap-2 border-t border-white/10 p-4"><button className="admin-button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span className="px-3 py-2 text-xs text-[#aaa59d]">{page} / {data.pagination.pages}</span><button className="admin-button" disabled={page >= data.pagination.pages} onClick={() => setPage(page + 1)}>Next</button></div></>}</AdminPanel><DecisionDialog key={selected?.id ?? 'closed'} appeal={selected} pending={update.isPending} onClose={() => setSelected(null)} onSubmit={(payload) => selected && update.mutate({ id: selected.id, ...payload })}/></section>;
}

function DecisionDialog({ appeal, pending, onClose, onSubmit }: { appeal: Appeal | null; pending: boolean; onClose: () => void; onSubmit: (input: { decisionStatus: 'under_review' | 'approved' | 'rejected'; decisionNote: string; mfaCode: string }) => void }) {
  const [decisionStatus, setDecisionStatus] = useState<'under_review' | 'approved' | 'rejected'>('under_review');
  const [decisionNote, setDecisionNote] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  return <Modal open={Boolean(appeal)} onClose={onClose} preventClose={pending} ariaLabel="Review content appeal" contentClassName="max-w-2xl bg-[#1c1a18] text-[#f2f0eb]"><div className="flex gap-3"><ShieldCheck className="text-[#e8816a]"/><div><h2 className="font-editorial text-2xl font-bold">Owner appeal</h2><p className="text-sm text-[#aaa59d]">{appeal?.title} · {appeal?.ownerName}</p></div></div><div className="mt-5 rounded-xl border border-white/10 bg-[#24211e] p-5 text-sm leading-6">{appeal?.reason}{appeal?.evidenceUrls.map((url) => <div key={url}><a className="text-[#e8816a]" href={url} target="_blank" rel="noreferrer">Evidence link</a></div>)}</div><label className="admin-field mt-4 block"><span>Decision</span><select value={decisionStatus} onChange={(event) => setDecisionStatus(event.target.value as typeof decisionStatus)}><option value="under_review">Claim and investigate</option><option value="approved">Approve and restore content</option><option value="rejected">Reject appeal</option></select></label><label className="admin-field mt-4 block"><span>User-facing decision note</span><textarea rows={5} value={decisionNote} onChange={(event) => setDecisionNote(event.target.value)} maxLength={3000}/></label><label className="admin-field mt-4 block"><span>Authenticator code</span><input inputMode="numeric" value={mfaCode} onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, ''))}/></label><div className="mt-6 flex justify-end gap-2"><button className="admin-button" onClick={onClose}>Cancel</button><button className="admin-primary-button" disabled={decisionNote.trim().length < 10 || pending} onClick={() => onSubmit({ decisionStatus, decisionNote: decisionNote.trim(), mfaCode })}>{pending ? 'Saving…' : 'Save decision'}</button></div></Modal>;
}
