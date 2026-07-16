import { useState } from 'react';
import { Download, Eye, ShieldAlert } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPanel,
  AdminSearch,
  AdminStatusBadge,
  downloadServerCsv,
  AdminBulkActionBar,
} from '../../shared';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import { useAdminMockTests } from '../hooks/useAdminMockTests';
import { ADMIN_MOCK_TESTS_ROUTES } from '../constants/admin-mock-tests.constants';

export default function AdminMockTestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(() => searchParams.get('status') || 'all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const { data, isLoading, isError, error } = useAdminMockTests({
    search: useDebouncedValue(search, 300),
    status,
    page,
  });
  const exportCurrentView = () => void downloadServerCsv('/admin/mock-tests/export.csv', `imminiq-mock-tests-${status}.csv`, { search, status });
  return (
    <main className="mx-auto max-w-[1240px] px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="Mock Test Management"
        description="Inspect assessment contents, questions, correct answers, and test configuration."
        action={
          <div className="flex gap-2"><button type="button" onClick={exportCurrentView} className="admin-button inline-flex items-center gap-2"><Download size={16} /> Export all CSV</button><Link
            to={ADMIN_MOCK_TESTS_ROUTES.reports}
            className="admin-primary-button inline-flex items-center gap-2"
          >
            <ShieldAlert size={16} /> Question reports
          </Link></div>
        }
      />
      <AdminMetricGrid
        metrics={[
          { label: 'All tests', value: data?.pagination.total ?? 0 },
          { label: 'Open reports', value: data?.stats?.openReports ?? 0, tone: 'error' },
          { label: 'Learner flags', value: data?.stats?.flags ?? 0, tone: 'info' },
          { label: 'Suspended', value: data?.stats?.suspended ?? 0, tone: 'warning' },
          { label: 'Attempts', value: data?.stats?.attempts ?? 0, tone: 'accent' },
        ]}
      />
      <AdminPanel
        title="Assessment inventory"
        toolbar={
          <div className="flex flex-wrap gap-3">
            <select
              value={status}
              onChange={(e) => {
                const nextStatus = e.target.value;
                setStatus(nextStatus);
                const next = new URLSearchParams(searchParams);
                if (nextStatus === 'all') next.delete('status');
                else next.set('status', nextStatus);
                setSearchParams(next, { replace: true });
                setPage(1);
              }}
              className="admin-select"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deleted">Deleted</option>
            </select>
            <AdminSearch
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search mock tests…"
            />
          </div>
        }
      >
        <div className="px-5 pt-4"><AdminBulkActionBar kind="mock-tests" selected={selected} onClear={() => setSelected([])} /></div>
        {isLoading ? (
          <AdminLoading />
        ) : isError ? (
          <AdminError error={error} />
        ) : !data?.items.length ? (
          <AdminEmpty />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="admin-table w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr>
                    <th><input aria-label="Select visible mock tests" type="checkbox" checked={data.items.every((item) => selected.includes(item.id))} onChange={(event) => setSelected(event.target.checked ? Array.from(new Set([...selected, ...data.items.map((item) => item.id)])) : selected.filter((id) => !data.items.some((item) => item.id === id)))} /></th>
                    <th>Test</th>
                    <th>Owner</th>
                    <th>Difficulty</th>
                    <th>Questions</th>
                    <th>Attempts</th>
                    <th>Average</th>
                    <th>Reports / flags</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td><input aria-label={`Select ${item.title}`} type="checkbox" checked={selected.includes(item.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, item.id] : selected.filter((id) => id !== item.id))} /></td>
                      <td>
                        <div className="font-semibold">{item.title}</div>
                        {item.isAIGenerated && (
                          <span className="text-[10px] text-[#6aa9ff]">AI generated</span>
                        )}
                      </td>
                      <td>{item.owner}</td>
                      <td>{item.difficulty}</td>
                      <td>{item.questionCount}</td>
                      <td>{item.attemptCount}</td>
                      <td>{Math.round(item.averageScore)}%</td>
                      <td>
                        <span className={item.openReportCount ? 'font-bold text-[#e26767]' : ''}>
                          {item.openReportCount} open / {item.reportCount} reports
                          <div className="mt-1 text-[10px] text-[#817c75]">{item.flagCount} review flags</div>
                        </span>
                      </td>
                      <td>
                        <AdminStatusBadge value={item.moderationStatus} />
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Link
                            to={ADMIN_MOCK_TESTS_ROUTES.detail(item.id)}
                            className="admin-button inline-flex items-center gap-2"
                          >
                            <Eye size={14} /> View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 p-4">
              <button
                className="admin-button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span className="px-3 py-2 text-xs text-[#aaa59d]">
                {page} / {data.pagination.pages}
              </span>
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
    </main>
  );
}
