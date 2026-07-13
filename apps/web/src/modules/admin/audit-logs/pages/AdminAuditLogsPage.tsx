import { useState } from 'react';
import { Eye, X } from 'lucide-react';
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
import { useAdminAuditLogs } from '../hooks/useAdminAuditLogs';
import type { AdminAuditLog } from '../types/admin-audit-logs.types';

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminAuditLog | null>(null);
  const { data, isLoading, isError } = useAdminAuditLogs({
    search: useDebouncedValue(search, 300),
    page,
    limit: 25,
  });
  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="Audit Logs"
        description="A read-only trace showing which administrator acted, the affected target, and the complete recorded change."
      />
      <AdminMetricGrid
        metrics={[
          { label: 'Recorded events', value: data?.pagination.total ?? 0 },
          { label: 'Product activity', value: data?.stats?.activity ?? 0, tone: 'info' },
          { label: 'Security events', value: data?.stats?.security ?? 0, tone: 'warning' },
        ]}
      />
      <AdminPanel
        title="Event stream"
        toolbar={
          <AdminSearch
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search events, admins, or targets…"
          />
        }
      >
        {isLoading ? (
          <AdminLoading />
        ) : isError ? (
          <AdminError />
        ) : !data?.items.length ? (
          <AdminEmpty />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="admin-table w-full min-w-245 text-left text-sm">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Administrator / actor</th>
                    <th>Affected target</th>
                    <th>Module</th>
                    <th>Outcome</th>
                    <th>Time</th>
                    <th>Details</th>
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
            <div className="flex justify-end gap-2 p-4">
              <button
                className="admin-button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
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
      {selected && <AuditDetail log={selected} close={() => setSelected(null)} />}
    </main>
  );
}
function AuditDetail({ log, close }: { log: AdminAuditLog; close: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-[#1c1a18] shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[#1c1a18] p-5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#e8816a]">Audit event</div>
            <h2 className="mt-1 text-xl font-bold">{log.action}</h2>
          </div>
          <button onClick={close} className="admin-icon-button">
            <X size={18} />
          </button>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
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
            <div className="mb-2 text-[10px] uppercase tracking-wider text-[#817c75]">
              Recorded change metadata
            </div>
            <pre className="overflow-x-auto rounded-lg bg-[#11110f] p-4 text-xs leading-6 text-[#aaa59d]">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#24211e] p-4">
      <div className="text-[10px] uppercase text-[#817c75]">{label}</div>
      <div className="mt-2 wrap-break-word text-sm font-semibold">{value}</div>
    </div>
  );
}
