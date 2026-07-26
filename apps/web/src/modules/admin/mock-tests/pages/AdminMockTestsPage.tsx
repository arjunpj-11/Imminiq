import { Database, Download, Eye, FileText, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  AdminBulkActionBar,
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
  downloadTablePdf,
  type AdminPageData,
} from '../../../../components/admin';
import { useDownloadAdminCsv } from '../../../../hooks/admin/useDownloadAdminCsv';
import { useExportAdminItems } from '../../../../hooks/admin/useExportAdminItems';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { toast } from '../../../../lib/toast';
import { useAdminMockTests } from '../hooks/useAdminMockTests';
import type { AdminMockTest } from '../types/admin-mock-tests.types';
import {
  ADMIN_MOCK_TESTS_ENDPOINTS,
  ADMIN_MOCK_TESTS_ROUTES,
} from '../constants/admin-mock-tests.constants';

const validStatuses = new Set(['all', 'active', 'suspended', 'deleted']);

export default function AdminMockTestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [selected, setSelected] = useState<string[]>([]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const csvExport = useDownloadAdminCsv();
  const exportItems = useExportAdminItems<AdminPageData<AdminMockTest>, AdminMockTest>();
  const debouncedSearch = useDebouncedValue(search, 300);
  const requestedStatus = searchParams.get('status') || 'all';
  const status = validStatuses.has(requestedStatus) ? requestedStatus : 'all';
  const requestedPage = Number(searchParams.get('page') || 1);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const updateParams = (updates: Record<string, string | number | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '' || value === 'all' || value === 1) next.delete(key);
      else next.set(key, String(value));
    }
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if ((searchParams.get('q') || '') === debouncedSearch) return;
    updateParams({ q: debouncedSearch || null, page: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    setSelected([]); // eslint-disable-line react-hooks/set-state-in-effect
  }, [debouncedSearch, status, page]);

  const { data, isLoading, isPlaceholderData, isError, error, refetch } = useAdminMockTests({
    search: debouncedSearch,
    status,
    page,
  });

  const exportCurrentView = () =>
    csvExport.mutate({
      endpoint: ADMIN_MOCK_TESTS_ENDPOINTS.exportCsv,
      filename: `imminiq-mock-tests-${status}.csv`,
      params: { search: debouncedSearch, status },
    });

  const exportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const tests = await exportItems.mutateAsync({
        endpoint: ADMIN_MOCK_TESTS_ENDPOINTS.list,
        params: {
          search: debouncedSearch || undefined,
          status,
        },
        selectItems: (response) => response.items,
        selectPageCount: (response) => response.pagination.pages,
      });
      const date = new Date().toISOString().slice(0, 10);
      await downloadTablePdf({
        filename: `imminiq-mock-tests-${status}-${date}.pdf`,
        title: 'Mock Test Management',
        description: 'Assessment inventory matching the selected administrator filters.',
        filters: [
          `Status: ${status === 'all' ? 'All statuses' : status}`,
          `Search: ${debouncedSearch || 'All mock tests'}`,
          `Matching tests: ${tests.length}`,
        ],
        summary: [
          { label: 'Matching tests', value: tests.length },
          { label: 'Open reports', value: data?.stats?.openReports ?? 0 },
          { label: 'Learner flags', value: data?.stats?.flags ?? 0 },
          { label: 'Attempts', value: data?.stats?.attempts ?? 0 },
        ],
        columns: [
          { header: 'Mock test', key: 'title', width: 112 },
          { header: 'Owner', key: 'owner', width: 78 },
          { header: 'Difficulty', key: 'difficulty', width: 54 },
          { header: 'Status', key: 'status', width: 58 },
          { header: 'Questions', key: 'questions', width: 46 },
          { header: 'Attempts', key: 'attempts', width: 46 },
          { header: 'Avg. score', key: 'averageScore', width: 52 },
          { header: 'Source', key: 'source', width: 48 },
          { header: 'Reports', key: 'reports', width: 54 },
          { header: 'Created', key: 'created', width: 72 },
        ],
        rows: tests.map((test) => ({
          title: test.title,
          owner: test.owner,
          difficulty: test.difficulty,
          status: test.moderationStatus,
          questions: test.questionCount,
          attempts: test.attemptCount,
          averageScore: `${test.averageScore}%`,
          source: test.isAIGenerated ? 'AI' : 'Manual',
          reports: `${test.openReportCount} open / ${test.reportCount} total`,
          created: new Date(test.createdAt).toLocaleDateString(),
        })),
      });
      toast.success('Mock test PDF downloaded', `${tests.length} matching assessments exported.`);
    } catch (error) {
      toast.error('Mock test PDF export failed', getUserFacingError(error));
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="Mock Test Management"
        description="Inspect assessment contents, questions, correct answers, and test configuration."
        action={
          <>
            <Link to={ADMIN_MOCK_TESTS_ROUTES.questionBank} className="admin-button">
              <Database size={16} aria-hidden="true" /> Question bank
            </Link>
            <button type="button" onClick={exportCurrentView} className="admin-button">
              <Download size={16} aria-hidden="true" /> Export all CSV
            </button>
            <button
              type="button"
              onClick={() => void exportPdf()}
              disabled={isExportingPdf}
              className="admin-button"
            >
              <FileText size={16} aria-hidden="true" />
              {isExportingPdf ? 'Preparing PDF…' : 'Export all PDF'}
            </button>
            <Link to={ADMIN_MOCK_TESTS_ROUTES.reports} className="admin-primary-button">
              <ShieldAlert size={16} aria-hidden="true" /> Question reports
            </Link>
          </>
        }
      />

      {isLoading ? (
        <div className="mt-7">
          <AdminCardSkeleton cards={5} label="Loading mock test metrics" />
        </div>
      ) : (
        <AdminMetricGrid
          metrics={[
            { label: 'All tests', value: data?.pagination.total ?? 0 },
            {
              label: 'Open reports',
              value: data?.stats?.openReports ?? 0,
              tone: 'error',
            },
            {
              label: 'Learner flags',
              value: data?.stats?.flags ?? 0,
              tone: 'info',
            },
            {
              label: 'Suspended',
              value: data?.stats?.suspended ?? 0,
              tone: 'warning',
            },
            {
              label: 'Attempts',
              value: data?.stats?.attempts ?? 0,
              tone: 'accent',
            },
          ]}
        />
      )}

      <AdminPanel
        title="Assessment inventory"
        toolbar={
          <div className="flex flex-wrap gap-3">
            <select
              value={status}
              onChange={(event) => updateParams({ status: event.target.value, page: null })}
              className="admin-select"
              aria-label="Filter mock tests by status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deleted">Deleted</option>
            </select>
            <AdminSearch value={search} onChange={setSearch} placeholder="Search mock tests…" />
          </div>
        }
      >
        <div className="px-4 pt-4 sm:px-5">
          <AdminBulkActionBar
            kind="mock-tests"
            selected={selected}
            onClear={() => setSelected([])}
          />
        </div>

        {isLoading || isPlaceholderData ? (
          <div className="admin-table-scroll overflow-x-auto">
            <AdminTableSkeleton columns={8} rows={8} label="Loading mock tests" />
          </div>
        ) : isError ? (
          <AdminError error={error} onRetry={() => void refetch()} />
        ) : !data?.items.length ? (
          <AdminEmpty>No mock tests match the current filters.</AdminEmpty>
        ) : (
          <>
            <div className="admin-table-scroll overflow-x-auto">
              <table className="admin-table w-full min-w-235 text-left text-sm">
                <caption className="sr-only">Mock tests matching the current filters</caption>
                <thead>
                  <tr>
                    <th scope="col">
                      <input
                        aria-label="Select visible mock tests"
                        type="checkbox"
                        checked={
                          Boolean(data.items.length) &&
                          data.items.every((item) => selected.includes(item.id))
                        }
                        onChange={(event) =>
                          setSelected(
                            event.target.checked
                              ? Array.from(
                                  new Set([...selected, ...data.items.map((item) => item.id)])
                                )
                              : selected.filter((id) => !data.items.some((item) => item.id === id))
                          )
                        }
                      />
                    </th>
                    <th scope="col">Test</th>
                    <th scope="col">Owner</th>
                    <th scope="col">Difficulty</th>
                    <th scope="col">Questions</th>
                    <th scope="col">Attempts</th>
                    <th scope="col">Average</th>
                    <th scope="col">Reports / flags</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <input
                          aria-label={`Select ${item.title}`}
                          type="checkbox"
                          checked={selected.includes(item.id)}
                          onChange={(event) =>
                            setSelected(
                              event.target.checked
                                ? Array.from(new Set([...selected, item.id]))
                                : selected.filter((id) => id !== item.id)
                            )
                          }
                        />
                      </td>
                      <td>
                        <div className="font-semibold">{item.title}</div>
                        {item.isAIGenerated && (
                          <span className="text-[10px] font-bold text-[#6aa9ff]">AI generated</span>
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
                        </span>
                        <div className="mt-1 text-[10px] text-[#817c75]">
                          {item.flagCount} review flags
                        </div>
                      </td>
                      <td>
                        <AdminStatusBadge value={item.moderationStatus} />
                      </td>
                      <td>
                        <Link to={ADMIN_MOCK_TESTS_ROUTES.detail(item.id)} className="admin-button">
                          <Eye size={14} aria-hidden="true" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPaginationControls
              page={page}
              pages={data.pagination.pages}
              label="mock tests"
              onPageChange={(nextPage) => updateParams({ page: nextPage })}
            />
          </>
        )}
      </AdminPanel>
    </main>
  );
}
