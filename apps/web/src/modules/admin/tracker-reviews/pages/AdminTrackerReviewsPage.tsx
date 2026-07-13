import { useState } from 'react';
import { Check, X } from 'lucide-react';
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
import {
  useAdminTrackerReviews,
  useResolveAdminTrackerReview,
} from '../hooks/useAdminTrackerReviews';

export default function AdminTrackerReviewsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const query = useAdminTrackerReviews({ search: useDebouncedValue(search, 300), status, page });
  const resolve = useResolveAdminTrackerReview();
  const data = query.data;
  return (
    <main className="mx-auto max-w-[1240px] px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="Tracker Reviews"
        description="Resolve community tracker verification cases using the recorded consensus signals."
      />
      <AdminMetricGrid
        metrics={[
          { label: 'All reviews', value: data?.pagination.total ?? 0 },
          { label: 'Open', value: data?.stats?.open ?? 0, tone: 'warning' },
          { label: 'Approved', value: data?.stats?.approved ?? 0, tone: 'success' },
          { label: 'Rejected', value: data?.stats?.rejected ?? 0, tone: 'error' },
        ]}
      />
      <AdminPanel
        title="Review queue"
        toolbar={
          <div className="flex gap-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="admin-select"
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <AdminSearch
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
            />
          </div>
        }
      >
        {query.isLoading ? (
          <AdminLoading />
        ) : query.isError ? (
          <AdminError />
        ) : !data?.items.length ? (
          <AdminEmpty>No tracker reviews match this view.</AdminEmpty>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr>
                  <th>Review</th>
                  <th>Owner</th>
                  <th>Category</th>
                  <th>Consensus</th>
                  <th>Status</th>
                  <th>Resolve</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="font-semibold">{item.title}</div>
                      {item.urgent && (
                        <span className="text-[10px] font-bold text-[#e26767]">URGENT</span>
                      )}
                    </td>
                    <td>{item.owner}</td>
                    <td>{item.category}</td>
                    <td>
                      <span className="text-[#52c58c]">{item.passVotes} pass</span> ·{' '}
                      <span className="text-[#e26767]">{item.failVotes} fail</span>
                    </td>
                    <td>
                      <AdminStatusBadge value={item.status} />
                    </td>
                    <td>
                      {item.status === 'open' ? (
                        <div className="flex gap-2">
                          <button
                            disabled={resolve.isPending}
                            onClick={() => resolve.mutate({ id: item.id, status: 'approved' })}
                            className="admin-icon-button text-[#52c58c]"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            disabled={resolve.isPending}
                            onClick={() => resolve.mutate({ id: item.id, status: 'rejected' })}
                            className="admin-icon-button text-[#e26767]"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </main>
  );
}
