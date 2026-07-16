import { useState } from 'react';
import { Download, Eye, FileBarChart, Flag, Globe2 } from 'lucide-react';
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
} from '../../shared';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import { useAdminTrackers } from '../hooks/useAdminTrackers';
import { ADMIN_TRACKERS_ROUTES } from '../constants/admin-trackers.constants';

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
  const [search, setSearch] = useState('');
  const requestedStatus = searchParams.get('status') ?? 'all';
  const status = trackerStatusFilters.has(requestedStatus) ? requestedStatus : 'all';
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useAdminTrackers({
    search: useDebouncedValue(search, 300),
    status,
    page,
  });
  const exportCurrentView = () => {
    if (!data?.items.length) return;
    const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = [['ID', 'Title', 'Owner', 'Category', 'Level', 'Visibility', 'Status', 'Moderation', 'Open reports', 'Topics'], ...data.items.map((item) => [item.id, item.title, item.owner, item.category, item.level, item.visibility, item.status, item.moderationStatus, item.openReportCount, item.topicsCount])];
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `imminiq-trackers-${status}-page-${page}.csv`; anchor.click(); URL.revokeObjectURL(url);
  };
  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="Tracker Management"
        description="Inspect learning structures, review community reports, and manage tracker access with documented reasons."
        action={
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportCurrentView} disabled={!data?.items.length} className="admin-button inline-flex items-center gap-2 disabled:opacity-40"><Download size={16} /> Export CSV</button>
            <Link to={ADMIN_TRACKERS_ROUTES.reports} className="admin-button inline-flex items-center gap-2"><Flag size={16} /> Tracker reports</Link>
            <Link to={ADMIN_TRACKERS_ROUTES.reviews} className="admin-button inline-flex items-center gap-2"><FileBarChart size={16} /> Community reviews</Link>
            <Link
              to={ADMIN_TRACKERS_ROUTES.published}
              className="admin-primary-button inline-flex items-center gap-2"
            >
              <Globe2 size={16} /> Published trackers
            </Link>
          </div>
        }
      />
      <AdminMetricGrid
        metrics={[
          { label: 'All trackers', value: data?.stats?.total ?? 0 },
          { label: 'Active', value: data?.stats?.active ?? 0, tone: 'success' },
          { label: 'Draft', value: data?.stats?.draft ?? 0, tone: 'warning' },
          { label: 'Open reports', value: data?.stats?.openReports ?? 0, tone: 'error' },
          { label: 'Suspended', value: data?.stats?.suspended ?? 0, tone: 'warning' },
        ]}
      />
      <AdminPanel
        title="All trackers"
        toolbar={
          <div className="flex flex-wrap gap-3">
            <select
              value={status}
              onChange={(e) => {
                setSearchParams(e.target.value === 'all' ? {} : { status: e.target.value });
                setPage(1);
              }}
              className="admin-select"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
              <option value="suspended">Suspended</option>
              <option value="deleted">Deleted</option>
            </select>
            <AdminSearch
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search trackers…"
            />
          </div>
        }
      >
        {isLoading ? (
          <AdminLoading />
        ) : isError ? (
          <AdminError error={error} />
        ) : !data?.items.length ? (
          <AdminEmpty />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="admin-table w-full min-w-225 text-left text-sm">
                <thead>
                  <tr>
                    <th>Tracker</th>
                    <th>Owner</th>
                    <th>Category</th>
                    <th>Visibility</th>
                    <th>Status</th>
                    <th>Moderation</th>
                    <th>Reports</th>
                    <th>Topics</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id}>
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
                      <td><AdminStatusBadge value={item.moderationStatus} /></td>
                      <td><span className={item.openReportCount ? 'font-bold text-[#e26767]' : ''}>{item.openReportCount} open / {item.reportCount}</span></td>
                      <td>{item.topicsCount}</td>
                      <td>
                        <div className="flex gap-2">
                          <Link
                            to={ADMIN_TRACKERS_ROUTES.detail(item.id)}
                            className="admin-button inline-flex items-center gap-2"
                          >
                            <Eye size={14} />
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager page={page} pages={data.pagination.pages} setPage={setPage} />
          </>
        )}
      </AdminPanel>
    </main>
  );
}
function Pager({
  page,
  pages,
  setPage,
}: {
  page: number;
  pages: number;
  setPage: (value: number) => void;
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-white/10 p-4">
      <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="admin-button">
        Previous
      </button>
      <span className="px-3 py-2 text-xs text-[#aaa59d]">
        {page} / {pages}
      </span>
      <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="admin-button">
        Next
      </button>
    </div>
  );
}
