import { useState } from 'react';
import { ArrowLeft, Eye, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router';
import Modal from '../../../../components/admin/AdminModal';
import {
  AdminContentAppealsPanel,
  AdminCardSkeleton,
  AdminEmpty,
  AdminError,
  AdminTableSkeleton,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPaginationControls,
  AdminPanel,
  AdminStatusBadge,
} from '../../../../components/admin';
import { ADMIN_TRACKERS_ROUTES } from '../constants/admin-trackers.constants';
import { useAdminTrackerReports } from '../hooks/useAdminTrackerReports';
import { useUpdateAdminTrackerReport } from '../hooks/useUpdateAdminTrackerReport';
import type {
  AdminTrackerReport,
  AdminTrackerReportUpdatePayload,
} from '../types/admin-trackers.types';
import AdminActionPasswordField from '../../../../components/admin/AdminActionPasswordField';
import { isAdminActionPasswordReady } from '../../../../lib/admin/admin-action-password';

const label = (value: string) => value.replaceAll('_', ' ');

export default function AdminTrackerReportsPage() {
  const [status, setStatus] = useState('open');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminTrackerReport | null>(null);
  const { data, isLoading, isPlaceholderData, isError, error, refetch } = useAdminTrackerReports({
    status,
    page,
  });
  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <Link
        to={ADMIN_TRACKERS_ROUTES.list}
        className="mb-5 inline-flex items-center gap-2 text-sm text-[#aaa59d] hover:text-[#e8816a]"
      >
        <ArrowLeft size={16} /> Back to trackers
      </Link>
      <AdminPageHeader
        title="Tracker Report Queue"
        description="Review community flags, document decisions, and keep reporters and tracker owners informed."
      />
      {isLoading ? (
        <div className="mt-7">
          <AdminCardSkeleton cards={4} label="Loading tracker report metrics" />
        </div>
      ) : (
        <AdminMetricGrid
          metrics={[
            { label: 'Open', value: data?.stats?.open ?? 0, tone: 'error' },
            {
              label: 'Reviewing',
              value: data?.stats?.reviewing ?? 0,
              tone: 'warning',
            },
            {
              label: 'Resolved',
              value: data?.stats?.resolved ?? 0,
              tone: 'success',
            },
            {
              label: 'Dismissed',
              value: data?.stats?.dismissed ?? 0,
              tone: 'info',
            },
          ]}
        />
      )}
      <AdminPanel
        title="Moderation inbox"
        toolbar={
          <select
            className="admin-select"
            aria-label="Filter tracker reports by status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">All reports</option>
            <option value="open">Open</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        }
      >
        {isLoading || isPlaceholderData ? (
          <div className="admin-table-scroll overflow-x-auto">
            <AdminTableSkeleton columns={7} rows={8} label="Loading tracker reports" />
          </div>
        ) : isError ? (
          <AdminError error={error} onRetry={() => void refetch()} />
        ) : !data?.items.length ? (
          <AdminEmpty>No tracker reports match this view.</AdminEmpty>
        ) : (
          <>
            <div className="admin-table-scroll overflow-x-auto">
              <table className="admin-table w-full min-w-225 text-left text-sm">
                <caption className="sr-only">Tracker moderation reports</caption>
                <thead>
                  <tr>
                    <th scope="col">Reported</th>
                    <th scope="col">Tracker</th>
                    <th scope="col">Reporter</th>
                    <th scope="col">Reason</th>
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((report) => (
                    <tr key={report.id}>
                      <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="font-semibold">{report.trackerTitle}</div>
                        <div className="text-xs text-[#817c75]">Owner: {report.trackerOwner}</div>
                      </td>
                      <td>{report.reporter}</td>
                      <td className="capitalize">{label(report.reason)}</td>
                      <td>
                        <AdminStatusBadge value={report.status} />
                      </td>
                      <td>
                        <button
                          className="admin-button inline-flex items-center gap-2"
                          onClick={() => setSelected(report)}
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
              label="tracker reports"
              onPageChange={setPage}
            />
          </>
        )}
      </AdminPanel>
      <ReportDialog
        key={selected?.id ?? 'closed'}
        report={selected}
        onClose={() => setSelected(null)}
      />
      <AdminContentAppealsPanel kind="trackers" />
    </main>
  );
}

function ReportDialog({
  report,
  onClose,
}: {
  report: AdminTrackerReport | null;
  onClose: () => void;
}) {
  const update = useUpdateAdminTrackerReport();
  const [status, setStatus] = useState<AdminTrackerReportUpdatePayload['status']>('reviewing');
  const [resolutionNote, setResolutionNote] = useState('');
  const [actionPassword, setActionPassword] = useState('');
  const submit = () => {
    if (!report || resolutionNote.trim().length < 10) return;
    update.mutate(
      {
        id: report.id,
        payload: {
          status,
          resolutionNote: resolutionNote.trim(),
          actionPassword,
        },
      },
      { onSuccess: onClose }
    );
  };
  return (
    <Modal
      open={Boolean(report)}
      onClose={onClose}
      preventClose={update.isPending}
      ariaLabel="Review tracker report"
      contentClassName="max-w-2xl bg-[#1c1a18] text-[#f2f0eb]"
    >
      <div className="flex gap-3">
        <ShieldAlert className="text-[#e8816a]" />
        <div>
          <h2 className="font-editorial text-2xl font-bold">Tracker report</h2>
          <p className="text-sm text-[#aaa59d]">{report?.trackerTitle}</p>
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-white/10 bg-[#24211e] p-4">
        <div className="text-xs uppercase text-[#e8816a]">{label(report?.reason ?? '')}</div>
        <p className="mt-2 text-sm leading-6 text-[#aaa59d]">
          {report?.details || 'No additional details provided.'}
        </p>
      </div>
      <label className="admin-field mt-5 block">
        <span>Decision</span>
        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as AdminTrackerReportUpdatePayload['status'])
          }
        >
          <option value="reviewing">Start reviewing</option>
          <option value="resolved">Resolve without content action</option>
          <option value="dismissed">Dismiss</option>
        </select>
      </label>
      <p className="mt-2 text-xs leading-5 text-[#817c75]">
        To suspend or delete the content, open the tracker and use its moderated lifecycle controls.
        That action resolves linked open reports automatically.
      </p>
      <label className="admin-field mt-4 block">
        <span>Note sent to reporter</span>
        <textarea
          rows={4}
          maxLength={1500}
          value={resolutionNote}
          onChange={(event) => setResolutionNote(event.target.value)}
        />
      </label>
      <AdminActionPasswordField
        value={actionPassword}
        onChange={setActionPassword}
        className="admin-field mt-4 block"
      />
      <div className="mt-6 flex justify-between gap-2">
        {report && (
          <Link to={ADMIN_TRACKERS_ROUTES.detail(report.trackerId)} className="admin-button">
            Open tracker
          </Link>
        )}
        <div className="flex gap-2">
          <button className="admin-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="admin-primary-button"
            disabled={
              resolutionNote.trim().length < 10 ||
              !isAdminActionPasswordReady(actionPassword) ||
              update.isPending
            }
            onClick={submit}
          >
            {update.isPending ? 'Saving…' : 'Save decision'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
