import { Download, Eye, FileBarChart, FileText, Flag, Globe2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
import { useAdminTrackers } from '../hooks/useAdminTrackers';
import type { AdminTracker } from '../types/admin-trackers.types';
import {
  ADMIN_TRACKERS_ENDPOINTS,
  ADMIN_TRACKERS_ROUTES,
} from '../constants/admin-trackers.constants';

const trackerStatusFilters = new Set([
  'all',
  'active',
  'draft',
  'archived',
  'suspended',
  'deleted',
]);

export default function AdminTrackersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const csvExport = useDownloadAdminCsv();
  const exportItems = useExportAdminItems<AdminPageData<AdminTracker>, AdminTracker>();
  const debouncedSearch = useDebouncedValue(search, 300);
  const requestedStatus = searchParams.get('status') ?? 'all';
  const status = trackerStatusFilters.has(requestedStatus) ? requestedStatus : 'all';
  const requestedPage = Number(searchParams.get('page') || 1);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [selectedState, setSelectedState] = useState<string[]>([]);

  useEffect(() => {
    setSelectedState([]); // eslint-disable-line react-hooks/set-state-in-effect
  }, [debouncedSearch, status, page]);

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

  const { data, isLoading, isPlaceholderData, isError, error, refetch } = useAdminTrackers({
    search: debouncedSearch,
    status,
    page,
  });

  const exportCurrentView = () =>
    csvExport.mutate({
      endpoint: ADMIN_TRACKERS_ENDPOINTS.exportCsv,
      filename: `imminiq-trackers-${status}.csv`,
      params: {
        search: debouncedSearch,
        status,
      },
    });

  const exportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const trackers = await exportItems.mutateAsync({
        endpoint: ADMIN_TRACKERS_ENDPOINTS.list,
        params: {
          search: debouncedSearch || undefined,
          status,
        },
        selectItems: (response) => response.items,
        selectPageCount: (response) => response.pagination.pages,
      });
      const date = new Date().toISOString().slice(0, 10);
      await downloadTablePdf({
        filename: `imminiq-trackers-${status}-${date}.pdf`,
        title: 'Tracker Management',
        description: 'Learning trackers matching the selected administrator filters.',
        filters: [
          `Status: ${status === 'all' ? 'All statuses' : status}`,
          `Search: ${debouncedSearch || 'All trackers'}`,
          `Matching trackers: ${trackers.length}`,
        ],
        summary: [
          { label: 'Matching trackers', value: trackers.length },
          { label: 'Active', value: data?.stats?.active ?? 0 },
          { label: 'Open reports', value: data?.stats?.openReports ?? 0 },
          { label: 'Suspended', value: data?.stats?.suspended ?? 0 },
        ],
        columns: [
          { header: 'Tracker', key: 'title', width: 105 },
          { header: 'Owner', key: 'owner', width: 76 },
          { header: 'Category', key: 'category', width: 64 },
          { header: 'Level', key: 'level', width: 48 },
          { header: 'Visibility', key: 'visibility', width: 54 },
          { header: 'Lifecycle', key: 'status', width: 54 },
          { header: 'Moderation', key: 'moderation', width: 62 },
          { header: 'Reports', key: 'reports', width: 48 },
          { header: 'Topics', key: 'topics', width: 40 },
          { header: 'Clones', key: 'clones', width: 40 },
          { header: 'Created', key: 'created', width: 70 },
        ],
        rows: trackers.map((tracker) => ({
          title: tracker.title,
          owner: tracker.owner,
          category: tracker.category,
          level: tracker.level,
          visibility: tracker.visibility,
          status: tracker.status,
          moderation: tracker.moderationStatus,
          reports: `${tracker.openReportCount} open / ${tracker.reportCount} total`,
          topics: tracker.topicsCount,
          clones: tracker.cloneCount,
          created: new Date(tracker.createdAt).toLocaleDateString(),
        })),
      });
      toast.success('Tracker PDF downloaded', `${trackers.length} matching trackers exported.`);
    } catch (error) {
      toast.error('Tracker PDF export failed', getUserFacingError(error));
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="Tracker Management"
        description="Inspect original learning trackers, review community reports, and manage tracker access. Personal clone records are excluded."
        action={
          <>
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
            <Link to={ADMIN_TRACKERS_ROUTES.reports} className="admin-button">
              <Flag size={16} aria-hidden="true" /> Tracker reports
            </Link>
            <Link to={ADMIN_TRACKERS_ROUTES.reviews} className="admin-button">
              <FileBarChart size={16} aria-hidden="true" /> Community reviews
            </Link>
            <Link to={ADMIN_TRACKERS_ROUTES.published} className="admin-primary-button">
              <Globe2 size={16} aria-hidden="true" /> Published trackers
            </Link>
          </>
        }
      />

      {isLoading ? (
        <div className="mt-7">
          <AdminCardSkeleton cards={5} label="Loading tracker metrics" />
        </div>
      ) : (
        <AdminMetricGrid
          metrics={[
            { label: 'All trackers', value: data?.stats?.total ?? 0 },
            { label: 'Active', value: data?.stats?.active ?? 0, tone: 'success' },
            { label: 'Draft', value: data?.stats?.draft ?? 0, tone: 'warning' },
            {
              label: 'Open reports',
              value: data?.stats?.openReports ?? 0,
              tone: 'error',
            },
            {
              label: 'Suspended',
              value: data?.stats?.suspended ?? 0,
              tone: 'warning',
            },
          ]}
        />
      )}

      <AdminPanel
        title="All trackers"
        toolbar={
          <div className="flex flex-wrap gap-3">
            <select
              value={status}
              onChange={(event) => updateParams({ status: event.target.value, page: null })}
              className="admin-select"
              aria-label="Filter trackers by status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
              <option value="suspended">Suspended</option>
              <option value="deleted">Deleted</option>
            </select>
            <AdminSearch value={search} onChange={setSearch} placeholder="Search trackers…" />
          </div>
        }
      >
        <div className="px-4 pt-4 sm:px-5">
          <AdminBulkActionBar
            kind="trackers"
            selected={selectedState}
            onClear={() => setSelectedState([])}
          />
        </div>

        {isLoading || isPlaceholderData ? (
          <div className="admin-table-scroll overflow-x-auto">
            <AdminTableSkeleton columns={8} rows={8} label="Loading trackers" />
          </div>
        ) : isError ? (
          <AdminError error={error} onRetry={() => void refetch()} />
        ) : !data?.items.length ? (
          <AdminEmpty>No trackers match the current filters.</AdminEmpty>
        ) : (
          <>
            <div className="admin-table-scroll overflow-x-auto">
              <table className="admin-table w-full min-w-225 text-left text-sm">
                <caption className="sr-only">Trackers matching the current filters</caption>
                <thead>
                  <tr>
                    <th scope="col">
                      <input
                        aria-label="Select visible trackers"
                        type="checkbox"
                        checked={
                          Boolean(data.items.length) &&
                          data.items.every((item) => selectedState.includes(item.id))
                        }
                        onChange={(event) =>
                          setSelectedState(
                            event.target.checked
                              ? Array.from(
                                  new Set([...selectedState, ...data.items.map((item) => item.id)])
                                )
                              : selectedState.filter(
                                  (id) => !data.items.some((item) => item.id === id)
                                )
                          )
                        }
                      />
                    </th>
                    <th scope="col">Tracker</th>
                    <th scope="col">Owner</th>
                    <th scope="col">Category</th>
                    <th scope="col">Visibility</th>
                    <th scope="col">Status</th>
                    <th scope="col">Moderation</th>
                    <th scope="col">Reports</th>
                    <th scope="col">Topics</th>
                    <th scope="col">Clones</th>
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
                          checked={selectedState.includes(item.id)}
                          onChange={(event) =>
                            setSelectedState(
                              event.target.checked
                                ? Array.from(new Set([...selectedState, item.id]))
                                : selectedState.filter((id) => id !== item.id)
                            )
                          }
                        />
                      </td>
                      <td>
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-xs text-[#817c75]">{item.level}</div>
                      </td>
                      <td>{item.owner}</td>
                      <td>{item.category}</td>
                      <td>
                        <AdminStatusBadge value={item.visibility} />
                      </td>
                      <td>
                        <AdminStatusBadge value={item.status} />
                      </td>
                      <td>
                        <AdminStatusBadge value={item.moderationStatus} />
                      </td>
                      <td>
                        <span className={item.openReportCount ? 'font-bold text-[#e26767]' : ''}>
                          {item.openReportCount} open / {item.reportCount}
                        </span>
                      </td>
                      <td>{item.topicsCount}</td>
                      <td>{item.cloneCount}</td>
                      <td>
                        <Link to={ADMIN_TRACKERS_ROUTES.detail(item.id)} className="admin-button">
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
              label="trackers"
              onPageChange={(nextPage) => updateParams({ page: nextPage })}
            />
          </>
        )}
      </AdminPanel>
    </main>
  );
}
