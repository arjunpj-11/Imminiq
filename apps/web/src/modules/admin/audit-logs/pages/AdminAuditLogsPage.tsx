import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Download, Eye, FileText } from 'lucide-react';
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
} from '../../../../components/admin';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import { toast } from '../../../../lib/toast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import {
  AdminDateRangeFilter,
  downloadCsv,
  downloadTablePdf,
  redactSensitiveMetadata,
  useAdminDateRange,
} from '../../../../components/admin';
import Modal from '../../../../components/admin/AdminModal';
import { useAdminAuditLogs } from '../hooks/useAdminAuditLogs';
import { useExportAdminAuditLogs } from '../hooks/useExportAdminAuditLogs';
import type { AdminAuditLog } from '../types/admin-audit-logs.types';

export default function AdminAuditLogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [selected, setSelected] = useState<AdminAuditLog | null>(null);
  const filteredSearch = useDebouncedValue(search, 300);
  const requestedPage = Number(searchParams.get('page') || 1);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const updateParams = (updates: Record<string, string | number | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 1) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if ((searchParams.get('q') || '') === filteredSearch) return;
    updateParams({ q: filteredSearch || null, page: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSearch]);
  const dateRange = useAdminDateRange(30);
  const exportLogs = useExportAdminAuditLogs();
  const { data, isLoading, isPlaceholderData, isError, error, refetch } = useAdminAuditLogs({
    search: filteredSearch,
    ...dateRange.range,
    page,
    limit: 25,
  });
  const downloadAuditReport = async (format: 'csv' | 'pdf') => {
    try {
      const items = await exportLogs.mutateAsync({
        search: filteredSearch,
        ...dateRange.range,
      });
      const date = new Date().toISOString().slice(0, 10);
      if (format === 'csv') {
        downloadCsv(`audit-logs-${date}.csv`, [
          ['AUDIT LOG REPORT'],
          ['Date range', `${dateRange.range.from} to ${dateRange.range.to}`],
          ['Search', filteredSearch || 'All events'],
          ['Matching events', items.length],
          [],
          [
            'Action',
            'Actor',
            'Actor ID',
            'Target',
            'Target ID',
            'Module',
            'Outcome',
            'IP address',
            'Timestamp',
            'Metadata',
          ],
          ...items.map((item) => [
            item.action,
            item.actor,
            item.actorId,
            item.target,
            item.targetId,
            item.module,
            item.outcome,
            item.ipAddress,
            item.createdAt,
            JSON.stringify(redactSensitiveMetadata(item.metadata)),
          ]),
        ]);
      } else {
        await downloadTablePdf({
          filename: `audit-logs-${date}.pdf`,
          title: 'Audit Logs',
          description: 'Administrative and security activity matching the selected filters.',
          filters: [
            `Date range: ${dateRange.range.from} to ${dateRange.range.to}`,
            `Search: ${filteredSearch || 'All events'}`,
            `Matching records: ${items.length}`,
          ],
          summary: [
            { label: 'Matching events', value: items.length },
            { label: 'Product activity', value: data?.stats?.activity ?? 0 },
            { label: 'Security events', value: data?.stats?.security ?? 0 },
          ],
          columns: [
            { header: 'Action', key: 'action', width: 92 },
            { header: 'Actor', key: 'actor', width: 76 },
            { header: 'Target', key: 'target', width: 72 },
            { header: 'Module', key: 'module', width: 62 },
            { header: 'Outcome', key: 'outcome', width: 52 },
            { header: 'IP address', key: 'ipAddress', width: 65 },
            { header: 'Timestamp', key: 'timestamp', width: 82 },
            { header: 'Recorded details', key: 'metadata' },
          ],
          rows: items.map((item) => ({
            action: item.action,
            actor: `${item.actor}${item.actorId ? `\n${item.actorId}` : ''}`,
            target: `${item.target ?? '-'}${item.targetId ? `\n${item.targetId}` : ''}`,
            module: item.module,
            outcome: item.outcome,
            ipAddress: item.ipAddress || '-',
            timestamp: new Date(item.createdAt).toLocaleString(),
            metadata: JSON.stringify(redactSensitiveMetadata(item.metadata)),
          })),
        });
      }
      toast.success(
        `Audit log ${format.toUpperCase()} downloaded`,
        `${items.length} matching events exported.`
      );
    } catch (error) {
      toast.error('Audit export failed', getUserFacingError(error));
    }
  };
  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="Audit Logs"
        description="A read-only trace showing which administrator acted, the affected target, and the complete recorded change."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              className="admin-button inline-flex items-center gap-2"
              disabled={exportLogs.isPending}
              onClick={() => void downloadAuditReport('csv')}
            >
              <Download size={16} />
              {exportLogs.isPending ? 'Preparing…' : 'Download CSV'}
            </button>
            <button
              className="admin-primary-button inline-flex items-center gap-2"
              disabled={exportLogs.isPending}
              onClick={() => void downloadAuditReport('pdf')}
            >
              <FileText size={16} />
              {exportLogs.isPending ? 'Preparing…' : 'Download PDF'}
            </button>
          </div>
        }
      />
      {isLoading ? (
        <div className="mt-7">
          <AdminCardSkeleton cards={3} label="Loading audit metrics" />
        </div>
      ) : (
        <AdminMetricGrid
          metrics={[
            { label: 'Recorded events', value: data?.pagination.total ?? 0 },
            {
              label: 'Product activity',
              value: data?.stats?.activity ?? 0,
              tone: 'info',
            },
            {
              label: 'Security events',
              value: data?.stats?.security ?? 0,
              tone: 'warning',
            },
          ]}
        />
      )}
      <AdminPanel
        title="Event stream"
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <AdminDateRangeFilter
              {...dateRange}
              setPreset={(value) => {
                dateRange.setPreset(value);
                updateParams({ page: null });
              }}
              setFrom={(value) => {
                dateRange.setFrom(value);
                updateParams({ page: null });
              }}
              setTo={(value) => {
                dateRange.setTo(value);
                updateParams({ page: null });
              }}
            />
            <AdminSearch
              value={search}
              onChange={setSearch}
              placeholder="Search events, admins, or targets…"
            />
          </div>
        }
      >
        {isLoading || isPlaceholderData ? (
          <div className="admin-table-scroll overflow-x-auto">
            <AdminTableSkeleton columns={7} rows={8} label="Loading audit logs" />
          </div>
        ) : isError ? (
          <AdminError error={error} onRetry={() => void refetch()} />
        ) : !data?.items.length ? (
          <AdminEmpty />
        ) : (
          <>
            <div className="admin-table-scroll overflow-x-auto">
              <table className="admin-table w-full min-w-245 text-left text-sm">
                <caption className="sr-only">Administrative audit event stream</caption>
                <thead>
                  <tr>
                    <th scope="col">Action</th>
                    <th scope="col">Administrator / actor</th>
                    <th scope="col">Affected target</th>
                    <th scope="col">Module</th>
                    <th scope="col">Outcome</th>
                    <th scope="col">Time</th>
                    <th scope="col">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td className="font-semibold">{item.action}</td>
                      <td>{item.actor}</td>
                      <td>{item.target ?? '—'}</td>
                      <td>{item.module}</td>
                      <td>
                        <AdminStatusBadge value={item.outcome} />
                      </td>
                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                      <td>
                        <button
                          className="admin-button inline-flex items-center gap-2"
                          onClick={() => setSelected(item)}
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
              label="audit logs"
              onPageChange={(nextPage) => updateParams({ page: nextPage })}
            />
          </>
        )}
      </AdminPanel>
      {selected && <AuditDetail log={selected} close={() => setSelected(null)} />}
    </main>
  );
}
function AuditDetail({ log, close }: { log: AdminAuditLog; close: () => void }) {
  const safeMetadata = redactSensitiveMetadata(log.metadata);
  return (
    <Modal
      open
      onClose={close}
      ariaLabel={`Audit event: ${log.action}`}
      contentClassName="max-w-2xl bg-[#1c1a18] text-[#f2f0eb]"
    >
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#e8816a]">
          Audit event
        </div>
        <h2 className="font-editorial mt-1 text-2xl font-bold">{log.action}</h2>
        <p className="mt-2 text-sm text-[#aaa59d]">
          Read-only security record. Sensitive metadata is masked in this view.
        </p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Detail
          label="Administrator / actor"
          value={`${log.actor}${log.actorId ? ` (${log.actorId})` : ''}`}
        />
        <Detail
          label="Affected target"
          value={`${log.target ?? 'None'}${log.targetId ? ` (${log.targetId})` : ''}`}
        />
        <Detail label="Module" value={log.module} />
        <Detail label="Outcome" value={log.outcome} />
        <Detail label="IP address" value={log.ipAddress || 'Not recorded'} />
        <Detail label="Timestamp" value={new Date(log.createdAt).toLocaleString()} />
        <div className="sm:col-span-2">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#817c75]">
            Recorded change metadata
          </div>
          <pre className="max-h-80 overflow-auto rounded-xl border border-white/10 bg-[#11110f] p-4 text-xs leading-6 text-[#aaa59d]">
            {JSON.stringify(safeMetadata, null, 2)}
          </pre>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button type="button" className="admin-button" onClick={close}>
          Close
        </button>
      </div>
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-info-tile p-4">
      <div className="text-[10px] font-bold uppercase tracking-wide text-[#817c75]">{label}</div>
      <div className="mt-2 wrap-break-word text-sm font-semibold">{value}</div>
    </div>
  );
}
