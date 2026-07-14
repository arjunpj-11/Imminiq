import { useState } from 'react';
import { ArrowLeft, Check, Eye, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';
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
import { toast } from '../../../../lib/toast';
import {
  useAddAdminTrackerReviewConsensus,
  useAdminTrackerReviews,
  useResolveAdminTrackerReview,
} from '../hooks/useAdminTrackerReviews';

export default function AdminTrackerReviewsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const query = useAdminTrackerReviews({ search: useDebouncedValue(search, 300), status, page });
  const resolve = useResolveAdminTrackerReview();
  const consensus = useAddAdminTrackerReviewConsensus();
  const data = query.data;
  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <Link
        to="/admin/trackers"
        className="mb-5 inline-flex items-center gap-2 text-sm text-[#aaa59d] hover:text-[#e8816a]"
      >
        <ArrowLeft size={16} /> Back to tracker management
      </Link>
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
            <table className="admin-table w-full min-w-275 text-left text-sm">
              <thead>
                <tr>
                  <th>Review</th>
                  <th>Owner</th>
                  <th>Category</th>
                  <th>Consensus</th>
                  <th>Status</th>
                  <th>Review</th>
                  <th>Final decision</th>
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
                      <div>
                        <span className="text-[#52c58c]">{item.passVotes} pass</span> ·{' '}
                        <span className="text-[#e26767]">{item.failVotes} fail</span>
                      </div>
                      {item.status === 'open' && (
                        <div className="mt-2 flex gap-2">
                          <button
                            disabled={consensus.isPending}
                            onClick={() =>
                              consensus.mutate(
                                { id: item.id, choice: 'pass' },
                                {
                                  onSuccess: () => toast.success('Pass vote added'),
                                  onError: () => toast.error('Could not add the pass vote'),
                                }
                              )
                            }
                            className="admin-button inline-flex items-center gap-1 text-[#52c58c]"
                            title="Add an administrator pass vote"
                          >
                            <ThumbsUp size={13} /> + Pass
                          </button>
                          <button
                            disabled={consensus.isPending}
                            onClick={() =>
                              consensus.mutate(
                                { id: item.id, choice: 'fail' },
                                {
                                  onSuccess: () => toast.success('Fail vote added'),
                                  onError: () => toast.error('Could not add the fail vote'),
                                }
                              )
                            }
                            className="admin-button inline-flex items-center gap-1 text-[#e26767]"
                            title="Add an administrator fail vote"
                          >
                            <ThumbsDown size={13} /> + Fail
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <AdminStatusBadge value={item.status} />
                    </td>
                    <td>
                      <Link
                        to={`/admin/trackers/${item.trackerId}`}
                        state={{ fromTrackerReview: true }}
                        className="admin-button inline-flex items-center gap-2"
                      >
                        <Eye size={14} />
                        View topics
                      </Link>
                    </td>
                    <td>
                      {item.status === 'open' ? (
                        <div className="flex gap-2">
                          <button
                            disabled={resolve.isPending}
                            onClick={() =>
                              resolve.mutate(
                                { id: item.id, status: 'approved' },
                                {
                                  onSuccess: () => toast.success('Tracker review approved'),
                                  onError: () => toast.error('Could not approve the tracker review'),
                                }
                              )
                            }
                            className="admin-icon-button text-[#52c58c]"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            disabled={resolve.isPending}
                            onClick={() =>
                              resolve.mutate(
                                { id: item.id, status: 'rejected' },
                                {
                                  onSuccess: () => toast.success('Tracker review rejected'),
                                  onError: () => toast.error('Could not reject the tracker review'),
                                }
                              )
                            }
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
