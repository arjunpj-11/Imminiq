import { useState } from 'react';
import { ArrowLeft, Eye, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
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
} from '../../../../components/admin';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import { toast } from '../../../../lib/toast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { useAdminPublishedTrackers } from '../hooks/useAdminPublishedTrackers';
import { useLikeAdminPublishedTracker } from '../hooks/useLikeAdminPublishedTracker';
import { useRateAdminPublishedTracker } from '../hooks/useRateAdminPublishedTracker';
import { ADMIN_TRACKERS_ROUTES } from '../constants/admin-trackers.constants';

export default function AdminPublishedTrackersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isPlaceholderData, isError, error, refetch } = useAdminPublishedTrackers(
    {
      search: useDebouncedValue(search, 300),
      page,
    }
  );
  const like = useLikeAdminPublishedTracker();
  const rate = useRateAdminPublishedTracker();
  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <Link
        to={ADMIN_TRACKERS_ROUTES.list}
        className="mb-5 inline-flex items-center gap-2 text-sm text-[#aaa59d] hover:text-[#e8816a]"
      >
        <ArrowLeft size={16} /> Back to tracker management
      </Link>
      <AdminPageHeader
        title="Published Trackers"
        description="Review every public tracker and its canonical likes, ratings, clones, and learning structure."
      />
      {isLoading ? (
        <div className="mt-7">
          <AdminCardSkeleton cards={3} label="Loading published tracker metrics" />
        </div>
      ) : (
        <AdminMetricGrid
          metrics={[
            { label: 'Published trackers', value: data?.stats?.published ?? 0 },
            {
              label: 'Total likes',
              value: data?.stats?.likes ?? 0,
              tone: 'success',
            },
            {
              label: 'Submitted ratings',
              value: data?.stats?.ratings ?? 0,
              tone: 'warning',
            },
          ]}
        />
      )}
      <AdminPanel
        title="Published tracker directory"
        toolbar={
          <AdminSearch
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search published trackers…"
          />
        }
      >
        {isLoading || isPlaceholderData ? (
          <div className="admin-table-scroll overflow-x-auto">
            <AdminTableSkeleton columns={8} rows={8} label="Loading published trackers" />
          </div>
        ) : isError ? (
          <AdminError error={error} onRetry={() => void refetch()} />
        ) : !data?.items.length ? (
          <AdminEmpty>No published trackers match this search.</AdminEmpty>
        ) : (
          <>
            <div className="admin-table-scroll overflow-x-auto">
              <table className="admin-table w-full min-w-275 text-left text-sm">
                <caption className="sr-only">Published trackers</caption>
                <thead>
                  <tr>
                    <th scope="col">Tracker</th>
                    <th scope="col">Owner</th>
                    <th scope="col">Published</th>
                    <th scope="col">Structure</th>
                    <th scope="col">Engagement</th>
                    <th scope="col">Your admin rating</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-xs text-[#817c75]">
                          {item.category} · {item.level}
                        </div>
                      </td>
                      <td>{item.owner}</td>
                      <td>{new Date(item.publishedAt).toLocaleDateString()}</td>
                      <td>
                        {item.topicsCount} topics · {item.cloneCount} clones
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 text-[#e26767]">
                            <Heart size={14} fill="currentColor" /> {item.likeCount}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#e8b85f]">
                            <Star size={14} fill="currentColor" /> {item.ratingAverage.toFixed(1)}
                            <span className="text-[#817c75]">({item.ratingCount})</span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1" aria-label="Set administrator rating">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              disabled={rate.isPending}
                              onClick={() =>
                                rate.mutate(
                                  { id: item.id, rating },
                                  {
                                    onSuccess: () => toast.success(`${rating}-star rating saved`),
                                    onError: (error) =>
                                      toast.error(
                                        'Could not save the rating',
                                        getUserFacingError(error)
                                      ),
                                  }
                                )
                              }
                              className="rounded p-1 hover:bg-white/10"
                              title={`Rate ${rating} out of 5`}
                            >
                              <Star
                                size={17}
                                className={
                                  rating <= (item.adminRating ?? 0)
                                    ? 'fill-[#e8b85f] text-[#e8b85f]'
                                    : 'text-[#817c75]'
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            disabled={item.adminLiked || like.isPending}
                            onClick={() =>
                              like.mutate(item.id, {
                                onSuccess: () => toast.success('Published tracker liked'),
                                onError: (error) =>
                                  toast.error(
                                    'Could not like the tracker',
                                    getUserFacingError(error)
                                  ),
                              })
                            }
                            className="admin-button inline-flex items-center gap-2"
                          >
                            <Heart size={14} fill={item.adminLiked ? 'currentColor' : 'none'} />
                            {item.adminLiked ? 'Liked' : 'Like'}
                          </button>
                          <Link
                            to={ADMIN_TRACKERS_ROUTES.detail(item.id)}
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
            <AdminPaginationControls
              page={page}
              pages={data.pagination.pages}
              label="published trackers"
              onPageChange={setPage}
            />
          </>
        )}
      </AdminPanel>
    </main>
  );
}
