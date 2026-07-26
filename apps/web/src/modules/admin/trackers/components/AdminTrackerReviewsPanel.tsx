import { useState } from 'react';
import { Check, Eye, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { Link } from 'react-router';
import {
  AdminCardSkeleton,
  AdminEmpty,
  AdminError,
  AdminTableSkeleton,
  AdminMetricGrid,
  AdminPanel,
  AdminPaginationControls,
  AdminSearch,
  AdminStatusBadge,
} from '../../../../components/admin';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import { toast } from '../../../../lib/toast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { useAdminTrackerReviews } from '../hooks/useAdminTrackerReviews';
import { useAddAdminTrackerReviewConsensus } from '../hooks/useAddAdminTrackerReviewConsensus';
import { useResolveAdminTrackerReview } from '../hooks/useResolveAdminTrackerReview';
import { ADMIN_TRACKERS_ROUTES } from '../constants/admin-trackers.constants';
import AdminActionPasswordField from '../../../../components/admin/AdminActionPasswordField';
import { isAdminActionPasswordReady } from '../../../../lib/admin/admin-action-password';

export default function AdminTrackerReviewsPanel() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [actionPassword, setActionPassword] = useState('');
  const query = useAdminTrackerReviews({
    search: useDebouncedValue(search, 300),
    status,
    page,
  });
  const resolve = useResolveAdminTrackerReview();
  const consensus = useAddAdminTrackerReviewConsensus();
  const data = query.data;

  return (
    <>
      {query.isLoading ? (
        <div className="mt-7">
          <AdminCardSkeleton cards={4} label="Loading tracker review metrics" />
        </div>
      ) : (
        <AdminMetricGrid
          metrics={[
            { label: 'All reviews', value: data?.pagination.total ?? 0 },
            { label: 'Open', value: data?.stats?.open ?? 0, tone: 'warning' },
            {
              label: 'Approved',
              value: data?.stats?.approved ?? 0,
              tone: 'success',
            },
            {
              label: 'Rejected',
              value: data?.stats?.rejected ?? 0,
              tone: 'error',
            },
          ]}
        />
      )}
      <AdminPanel
        title="Community verification queue"
        toolbar={
          <div className="flex flex-wrap gap-3">
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="admin-select"
              aria-label="Filter tracker reviews by status"
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <AdminSearch
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search community reviews…"
            />
          </div>
        }
      >
        <div className="border-b border-white/10 px-5 pb-5">
          <AdminActionPasswordField
            value={actionPassword}
            onChange={setActionPassword}
            className="admin-field block max-w-md"
          />
          <p className="mt-2 text-xs text-[#817c75]">
            Required for consensus votes and final decisions.
          </p>
        </div>
        {query.isLoading || query.isPlaceholderData ? (
          <div className="admin-table-scroll overflow-x-auto">
            <AdminTableSkeleton columns={7} rows={7} label="Loading tracker reviews" />
          </div>
        ) : query.isError ? (
          <AdminError error={query.error} onRetry={() => void query.refetch()} />
        ) : !data?.items.length ? (
          <AdminEmpty>No community reviews match this view.</AdminEmpty>
        ) : (
          <>
            <div className="admin-table-scroll overflow-x-auto">
              <table className="admin-table w-full min-w-275 text-left text-sm">
                <caption className="sr-only">Tracker publication review queue</caption>
                <thead>
                  <tr>
                    <th scope="col">Tracker</th>
                    <th scope="col">Owner</th>
                    <th scope="col">Category</th>
                    <th scope="col">Consensus</th>
                    <th scope="col">Status</th>
                    <th scope="col">Content</th>
                    <th scope="col">Final decision</th>
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
                              disabled={
                                consensus.isPending || !isAdminActionPasswordReady(actionPassword)
                              }
                              onClick={() =>
                                consensus.mutate(
                                  { id: item.id, choice: 'pass', actionPassword },
                                  {
                                    onSuccess: () => toast.success('Pass vote added'),
                                    onError: (error) =>
                                      toast.error(
                                        'Could not add the pass vote',
                                        getUserFacingError(error)
                                      ),
                                  }
                                )
                              }
                              className="admin-button inline-flex items-center gap-1 text-[#52c58c]"
                              title="Add an administrator pass vote"
                            >
                              <ThumbsUp size={13} /> + Pass
                            </button>
                            <button
                              disabled={
                                consensus.isPending || !isAdminActionPasswordReady(actionPassword)
                              }
                              onClick={() =>
                                consensus.mutate(
                                  { id: item.id, choice: 'fail', actionPassword },
                                  {
                                    onSuccess: () => toast.success('Fail vote added'),
                                    onError: (error) =>
                                      toast.error(
                                        'Could not add the fail vote',
                                        getUserFacingError(error)
                                      ),
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
                          to={ADMIN_TRACKERS_ROUTES.detail(item.trackerId)}
                          state={{ fromTrackerReview: true }}
                          className="admin-button inline-flex items-center gap-2"
                        >
                          <Eye size={14} /> View topics
                        </Link>
                      </td>
                      <td>
                        {item.status === 'open' ? (
                          <div className="flex gap-2">
                            <button
                              disabled={
                                resolve.isPending || !isAdminActionPasswordReady(actionPassword)
                              }
                              onClick={() =>
                                resolve.mutate(
                                  { id: item.id, status: 'approved', actionPassword },
                                  {
                                    onSuccess: () => toast.success('Community review approved'),
                                    onError: (error) =>
                                      toast.error(
                                        'Could not approve the community review',
                                        getUserFacingError(error)
                                      ),
                                  }
                                )
                              }
                              className="admin-icon-button text-[#52c58c]"
                              title="Approve"
                              aria-label={`Approve review for ${item.title}`}
                            >
                              <Check size={16} />
                            </button>
                            <button
                              disabled={
                                resolve.isPending || !isAdminActionPasswordReady(actionPassword)
                              }
                              onClick={() =>
                                resolve.mutate(
                                  { id: item.id, status: 'rejected', actionPassword },
                                  {
                                    onSuccess: () => toast.success('Community review rejected'),
                                    onError: (error) =>
                                      toast.error(
                                        'Could not reject the community review',
                                        getUserFacingError(error)
                                      ),
                                  }
                                )
                              }
                              className="admin-icon-button text-[#e26767]"
                              title="Reject"
                              aria-label={`Reject review for ${item.title}`}
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
            <AdminPaginationControls
              page={page}
              pages={data.pagination.pages}
              label="tracker reviews"
              onPageChange={setPage}
            />
          </>
        )}
      </AdminPanel>
    </>
  );
}
