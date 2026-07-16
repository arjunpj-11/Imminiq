import { useState } from 'react';
import { ArrowLeft, Eye, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../../../../components/overlays/Modal';
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '../../shared';
import { ADMIN_MOCK_TESTS_ROUTES } from '../constants/admin-mock-tests.constants';
import { useAdminMockTestReports } from '../hooks/useAdminMockTestReports';
import { useUpdateAdminMockTestReport } from '../hooks/useUpdateAdminMockTestReport';
import type {
  AdminMockTestIssueUpdatePayload,
  AdminMockTestQuestionIssue,
} from '../types/admin-mock-tests.types';

const reasonLabel = (value: string) => value.replaceAll('_', ' ');

export default function AdminMockTestReportsPage() {
  const [status, setStatus] = useState('open');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminMockTestQuestionIssue | null>(null);
  const { data, isLoading, isError, error } = useAdminMockTestReports({ status, page });

  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <Link
        to={ADMIN_MOCK_TESTS_ROUTES.list}
        className="mb-5 inline-flex items-center gap-2 text-sm text-[#aaa59d] hover:text-[#e8816a]"
      >
        <ArrowLeft size={16} /> Back to mock tests
      </Link>
      <AdminPageHeader
        title="Question Report Queue"
        description="Triage learner reports, inspect the exact question context, document decisions, and notify reporters."
      />
      <AdminMetricGrid
        metrics={[
          { label: 'Open', value: data?.stats?.open ?? 0, tone: 'error' },
          { label: 'Reviewing', value: data?.stats?.reviewing ?? 0, tone: 'warning' },
          { label: 'Resolved', value: data?.stats?.resolved ?? 0, tone: 'success' },
          { label: 'Dismissed', value: data?.stats?.dismissed ?? 0, tone: 'info' },
        ]}
      />
      <AdminPanel
        title="Moderation inbox"
        toolbar={
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="admin-select"
          >
            <option value="all">All reports</option>
            <option value="open">Open</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        }
      >
        {isLoading ? (
          <AdminLoading />
        ) : isError ? (
          <AdminError error={error} />
        ) : !data?.items.length ? (
          <AdminEmpty>No question reports match this view.</AdminEmpty>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="admin-table w-full min-w-250 text-left text-sm">
                <thead>
                  <tr>
                    <th>Age</th>
                    <th>Test / question</th>
                    <th>Reported by</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((issue) => (
                    <tr key={issue.id}>
                      <td>{new Date(issue.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="font-semibold">{issue.testTitle}</div>
                        <div className="max-w-100 truncate text-xs text-[#817c75]">
                          Q{issue.questionOrder}: {issue.question}
                        </div>
                      </td>
                      <td>
                        {issue.reporter}
                        <div className="text-xs text-[#817c75]">{issue.reporterEmail}</div>
                      </td>
                      <td className="capitalize">{reasonLabel(issue.reason)}</td>
                      <td><AdminStatusBadge value={issue.status} /></td>
                      <td>
                        <button
                          className="admin-button inline-flex items-center gap-2"
                          onClick={() => setSelected(issue)}
                        >
                          <Eye size={14} /> Review
                        </button>
                      </td>
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
      <ReportReviewDialog
        key={selected?.id ?? 'closed'}
        issue={selected}
        onClose={() => setSelected(null)}
      />
    </main>
  );
}

function ReportReviewDialog({
  issue,
  onClose,
}: {
  issue: AdminMockTestQuestionIssue | null;
  onClose: () => void;
}) {
  const update = useUpdateAdminMockTestReport();
  const [status, setStatus] = useState<AdminMockTestIssueUpdatePayload['status']>('reviewing');
  const [resolutionAction, setResolutionAction] =
    useState<AdminMockTestIssueUpdatePayload['resolutionAction']>('none');
  const [resolutionNote, setResolutionNote] = useState('');
  const submit = () => {
    if (!issue || resolutionNote.trim().length < 10) return;
    update.mutate(
      { id: issue.id, payload: { status, resolutionAction, resolutionNote: resolutionNote.trim() } },
      { onSuccess: onClose }
    );
  };
  return (
    <Modal
      open={Boolean(issue)}
      onClose={onClose}
      preventClose={update.isPending}
      ariaLabel="Review question report"
      contentClassName="max-w-2xl bg-[#1c1a18] text-[#f2f0eb]"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-1 text-[#e8816a]" />
        <div>
          <h2 className="font-editorial text-2xl font-bold">Question report</h2>
          <p className="text-sm text-[#aaa59d]">{issue?.testTitle} · Question {issue?.questionOrder}</p>
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-white/10 bg-[#24211e] p-4">
        <div className="text-xs uppercase text-[#e8816a]">Question</div>
        <p className="mt-2 font-semibold leading-6">{issue?.question}</p>
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div><dt className="text-xs text-[#817c75]">Reason</dt><dd className="capitalize">{reasonLabel(issue?.reason ?? '')}</dd></div>
        <div><dt className="text-xs text-[#817c75]">Reporter</dt><dd>{issue?.reporter}</dd></div>
      </dl>
      <div className="mt-4 rounded-lg border border-white/10 p-4 text-sm text-[#aaa59d]">
        {issue?.details || 'The reporter did not add further details.'}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="admin-field"><span>Decision</span><select value={status} onChange={(event) => setStatus(event.target.value as AdminMockTestIssueUpdatePayload['status'])}><option value="reviewing">Start reviewing</option><option value="resolved">Resolve</option><option value="dismissed">Dismiss</option></select></label>
        <label className="admin-field"><span>Resolution classification</span><select value={resolutionAction} onChange={(event) => setResolutionAction(event.target.value as AdminMockTestIssueUpdatePayload['resolutionAction'])}><option value="none">No linked content action</option><option value="question_corrected">Question correction recorded</option><option value="question_disabled">Question disabled / retired</option><option value="test_suspended">Test suspension recorded</option><option value="test_deleted">Test deletion recorded</option></select></label>
      </div>
      <label className="admin-field mt-4 block"><span>Resolution note sent to reporter</span><textarea rows={4} maxLength={1500} value={resolutionNote} onChange={(event) => setResolutionNote(event.target.value)} placeholder="Explain what was reviewed and why this decision was made…" /></label>
      <div className="mt-6 flex flex-wrap justify-between gap-2">
        {issue && <Link to={ADMIN_MOCK_TESTS_ROUTES.detail(issue.testId)} className="admin-button">Open full test</Link>}
        <div className="flex gap-2"><button className="admin-button" onClick={onClose}>Cancel</button><button className="admin-primary-button" disabled={resolutionNote.trim().length < 10 || update.isPending} onClick={submit}>{update.isPending ? 'Saving…' : 'Save decision'}</button></div>
      </div>
    </Modal>
  );
}
