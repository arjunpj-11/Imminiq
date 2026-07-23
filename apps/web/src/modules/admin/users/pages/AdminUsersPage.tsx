import { Download, Eye, FileText, Scale } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AdminBulkActionBar,
  AdminCardSkeleton,
  AdminEmpty,
  AdminError,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPaginationControls,
  AdminPanel,
  AdminRefreshingIndicator,
  AdminSearch,
  AdminStatusBadge,
  AdminTableSkeleton,
  downloadTablePdf,
} from '../../../../components/admin';
import { useDownloadAdminCsv } from '../../../../hooks/admin/useDownloadAdminCsv';
import { useExportAdminItems } from '../../../../hooks/admin/useExportAdminItems';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import UserAvatar from '../../../../components/data-display/UserAvatar';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { toast } from '../../../../lib/toast';
import { useAdminUsers } from '../hooks/useAdminUsers';
import type { AdminUser, AdminUsersData } from '../types/admin-users.types';
import {
  ADMIN_USER_FILTERS,
  ADMIN_USERS_ENDPOINTS,
  ADMIN_USERS_ROUTES,
  ADMIN_USERS_SEARCH_DEBOUNCE_MS,
} from '../constants/admin-users.constants';

const number = new Intl.NumberFormat('en-US');
const validStatuses = new Set<string>(ADMIN_USER_FILTERS);

export default function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const csvExport = useDownloadAdminCsv();
  const exportItems = useExportAdminItems<AdminUsersData, AdminUser>();
  const debouncedSearch = useDebouncedValue(search, ADMIN_USERS_SEARCH_DEBOUNCE_MS);
  const requestedStatus = searchParams.get('status') || 'all';
  const status = validStatuses.has(requestedStatus)
    ? (requestedStatus as (typeof ADMIN_USER_FILTERS)[number])
    : 'all';
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
    // The current URL object is intentionally the source of truth for filters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = useAdminUsers(
    {
      search: debouncedSearch,
      status,
      page,
    }
  );

  const exportCurrentView = () =>
    csvExport.mutate({
      endpoint: ADMIN_USERS_ENDPOINTS.exportCsv,
      filename: `imminiq-users-${status}.csv`,
      params: {
        search: debouncedSearch,
        status,
      },
    });

  const exportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const users = await exportItems.mutateAsync({
        endpoint: ADMIN_USERS_ENDPOINTS.list,
        params: {
          search: debouncedSearch || undefined,
          status,
        },
        selectItems: (response) => response.users,
        selectPageCount: (response) => response.pagination.pages,
      });
      const date = new Date().toISOString().slice(0, 10);
      await downloadTablePdf({
        filename: `imminiq-users-${status}-${date}.pdf`,
        title: 'User Management',
        description: 'User accounts matching the selected administrator filters.',
        filters: [
          `Status: ${status === 'all' ? 'All statuses' : status}`,
          `Search: ${debouncedSearch || 'All users'}`,
          `Matching users: ${users.length}`,
        ],
        summary: [
          { label: 'Matching users', value: users.length },
          { label: 'Active accounts', value: data?.stats.active ?? 0 },
          { label: 'Suspended', value: data?.stats.paused ?? 0 },
          { label: 'Blocked', value: data?.stats.blocked ?? 0 },
        ],
        columns: [
          { header: 'Name', key: 'name', width: 92 },
          { header: 'Username', key: 'username', width: 68 },
          { header: 'Contact', key: 'contact', width: 116 },
          { header: 'Role', key: 'role', width: 58 },
          { header: 'Status', key: 'status', width: 58 },
          { header: 'Plan', key: 'plan', width: 48 },
          { header: 'Verified', key: 'verified', width: 55 },
          { header: 'Last active', key: 'lastActive', width: 84 },
          { header: 'Joined', key: 'joined', width: 76 },
        ],
        rows: users.map((user) => ({
          name: user.fullName,
          username: `@${user.username}`,
          contact: user.email || user.phone || 'Not provided',
          role: user.role,
          status: user.status,
          plan: user.isPremium ? 'Premium' : 'Standard',
          verified:
            [user.emailVerified ? 'Email' : null, user.phoneVerified ? 'Phone' : null]
              .filter(Boolean)
              .join(', ') || 'No',
          lastActive: user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : 'Never',
          joined: new Date(user.createdAt).toLocaleDateString(),
        })),
      });
      toast.success('User PDF downloaded', `${users.length} matching accounts exported.`);
    } catch (error) {
      toast.error('User PDF export failed', getUserFacingError(error));
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="User Management"
        description="Manage account access, user history, privacy requests, appeals, and internal support context."
        action={
          <>
            <button type="button" onClick={exportCurrentView} className="admin-button">
              <Download size={16} aria-hidden="true" />
              Export all CSV
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
            <Link to={ADMIN_USERS_ROUTES.appeals} className="admin-button">
              <Scale size={16} aria-hidden="true" />
              Account appeals
            </Link>
          </>
        }
      />

      {isLoading ? (
        <div className="mt-7">
          <AdminCardSkeleton label="Loading user metrics" />
        </div>
      ) : (
        <AdminMetricGrid
          metrics={[
            { label: 'Total users', value: data?.stats.total ?? 0 },
            {
              label: 'Active accounts',
              value: data?.stats.active ?? 0,
              tone: 'success',
            },
            {
              label: 'Suspended',
              value: data?.stats.paused ?? 0,
              tone: 'warning',
            },
            { label: 'Blocked', value: data?.stats.blocked ?? 0, tone: 'error' },
          ]}
        />
      )}

      <AdminPanel
        title="All users"
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            {isFetching && !isLoading && !isPlaceholderData && (
              <AdminRefreshingIndicator label="Updating users" />
            )}
            <div
              className="admin-segmented-control max-w-full overflow-x-auto"
              aria-label="Filter users by status"
            >
              {ADMIN_USER_FILTERS.map((filter) => (
                <button
                  type="button"
                  key={filter}
                  aria-pressed={status === filter}
                  className="whitespace-nowrap capitalize"
                  onClick={() => updateParams({ status: filter, page: null })}
                >
                  {filter}
                </button>
              ))}
            </div>
            <AdminSearch
              value={search}
              onChange={setSearch}
              placeholder="Search users, names, emails…"
            />
          </div>
        }
      >
        <div className="px-4 pt-4 sm:px-6">
          <AdminBulkActionBar
            kind="users"
            selected={selectedState}
            onClear={() => setSelectedState([])}
          />
        </div>

        {isLoading || isPlaceholderData ? (
          <div className="admin-table-scroll overflow-x-auto">
            <AdminTableSkeleton columns={7} rows={8} label="Loading users" />
          </div>
        ) : isError ? (
          <AdminError error={error} onRetry={() => void refetch()} />
        ) : !data?.users.length ? (
          <AdminEmpty>No users match the selected filters.</AdminEmpty>
        ) : (
          <>
            <div className="admin-table-scroll overflow-x-auto">
              <table className="admin-table w-full min-w-225 text-left text-sm">
                <caption className="sr-only">
                  User accounts matching the current search and status filters
                </caption>
                <thead>
                  <tr>
                    <th scope="col">
                      <input
                        aria-label="Select visible users"
                        type="checkbox"
                        checked={
                          Boolean(data.users.length) &&
                          data.users.every((item) => selectedState.includes(item._id))
                        }
                        onChange={(event) =>
                          setSelectedState(
                            event.target.checked
                              ? Array.from(
                                  new Set([...selectedState, ...data.users.map((item) => item._id)])
                                )
                              : selectedState.filter(
                                  (id) => !data.users.some((item) => item._id === id)
                                )
                          )
                        }
                      />
                    </th>
                    <th scope="col">User</th>
                    <th scope="col">Role</th>
                    <th scope="col">Contact</th>
                    <th scope="col">Status</th>
                    <th scope="col">Last activity</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user) => (
                    <tr
                      key={user._id}
                      className={
                        user.status === 'blocked'
                          ? 'bg-[rgba(226,103,103,0.06)]'
                          : user.status === 'paused'
                            ? 'bg-[rgba(240,168,66,0.05)]'
                            : ''
                      }
                    >
                      <td>
                        <input
                          aria-label={`Select ${user.fullName}`}
                          type="checkbox"
                          checked={selectedState.includes(user._id)}
                          onChange={(event) =>
                            setSelectedState(
                              event.target.checked
                                ? Array.from(new Set([...selectedState, user._id]))
                                : selectedState.filter((id) => id !== user._id)
                            )
                          }
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={user.fullName}
                            src={user.avatarUrl}
                            className="border border-white/10"
                            fallbackClassName="bg-[#2a2723] font-editorial text-[#e8816a]"
                          />
                          <div className="min-w-0">
                            <div className="max-w-52 truncate font-semibold">{user.fullName}</div>
                            <div className="text-[11px] text-[#aaa59d]">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <AdminStatusBadge value={user.role} />
                      </td>
                      <td className="text-[#aaa59d]">{user.email || user.phone || '—'}</td>
                      <td>
                        <AdminStatusBadge value={user.status} />
                      </td>
                      <td className="text-[#aaa59d]">
                        {new Date(user.lastActiveAt).toLocaleDateString()}
                      </td>
                      <td>
                        <Link to={ADMIN_USERS_ROUTES.detail(user._id)} className="admin-button">
                          <Eye size={15} aria-hidden="true" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#141412] px-4 py-3 sm:px-6">
              <span className="text-xs text-[#aaa59d]">
                Showing {data.users.length} of {number.format(data.pagination.total)} users
              </span>
              <AdminPaginationControls
                page={page}
                pages={data.pagination.pages}
                label="users"
                onPageChange={(nextPage) => updateParams({ page: nextPage })}
              />
            </div>
          </>
        )}
      </AdminPanel>
    </main>
  );
}
