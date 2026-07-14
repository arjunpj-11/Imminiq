import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../../../routes/config/route-paths';

import FriendRequestsView from '../components/requests/FriendRequestsView';
import FriendsAppShell from '../components/shared/FriendsAppShell';
import FriendsHeader from '../components/shared/FriendsHeader';
import FriendsListView from '../components/list/FriendsListView';
import FriendsSearchInput from '../components/search/FriendsSearchInput';
import {
  FriendsActionError,
  FriendsErrorState,
  FriendsListSkeleton,
  FriendsRequestsSkeleton,
} from '../components/shared/FriendsStates';
import FriendsTabs from '../components/shared/FriendsTabs';
import RemoveFriendDialog from '../components/list/RemoveFriendDialog';
import { UserPlusIcon } from '../components/icons/FriendsIcons';
import {
  FRIENDS_DEFAULT_PAGE_SIZE,
  FRIENDS_SEARCH_DEBOUNCE_MS,
} from '../constants/friends.constants';
import { useAcceptFriendRequest } from '../hooks/useAcceptFriendRequest';
import { useCancelFriendRequest } from '../hooks/useCancelFriendRequest';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import { useDeclineFriendRequest } from '../hooks/useDeclineFriendRequest';
import { useFriends } from '../hooks/useFriends';
import { useReceivedFriendRequests } from '../hooks/useReceivedFriendRequests';
import { useRemoveFriend } from '../hooks/useRemoveFriend';
import { useSentFriendRequests } from '../hooks/useSentFriendRequests';
import type { IFriendRequest, IFriendUser, FriendsTab } from '../types/friends.types';
import {
  getFriendsApiErrorMessage,
  mergeFriendRequestPages,
  mergeFriendUserPages,
  normalizeSearchQuery,
  parseFriendsTab,
} from '../utils/friends-formatters';

export default function FriendsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseFriendsTab(searchParams.get('tab'));
  const [friendSearch, setFriendSearch] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<IFriendUser | null>(null);
  const [actionError, setActionError] = useState<string>();

  const debouncedSearch = useDebouncedValue(
    normalizeSearchQuery(friendSearch),
    FRIENDS_SEARCH_DEBOUNCE_MS
  );

  const friendsQuery = useFriends({
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    limit: FRIENDS_DEFAULT_PAGE_SIZE,
  });
  const receivedQuery = useReceivedFriendRequests({
    limit: FRIENDS_DEFAULT_PAGE_SIZE,
  });
  const sentQuery = useSentFriendRequests({
    limit: FRIENDS_DEFAULT_PAGE_SIZE,
  });

  const acceptMutation = useAcceptFriendRequest();
  const declineMutation = useDeclineFriendRequest();
  const cancelMutation = useCancelFriendRequest();
  const removeMutation = useRemoveFriend();

  const friends = useMemo(
    () => mergeFriendUserPages(friendsQuery.data?.pages ?? []),
    [friendsQuery.data?.pages]
  );
  const received = useMemo(
    () => mergeFriendRequestPages(receivedQuery.data?.pages ?? []),
    [receivedQuery.data?.pages]
  );
  const sent = useMemo(
    () => mergeFriendRequestPages(sentQuery.data?.pages ?? []),
    [sentQuery.data?.pages]
  );

  const friendsFirstPage = friendsQuery.data?.pages[0];
  const receivedFirstPage = receivedQuery.data?.pages[0];
  const sentFirstPage = sentQuery.data?.pages[0];

  const changeTab = (tab: FriendsTab) => {
    setActionError(undefined);
    setSearchParams(tab === 'requests' ? { tab: 'requests' } : {}, {
      replace: true,
    });
  };

  const handleAccept = (request: IFriendRequest) => {
    setActionError(undefined);
    acceptMutation.mutate(
      { requestId: request.id },
      {
        onError: (error) =>
          setActionError(
            getFriendsApiErrorMessage(error, 'The friend invite could not be accepted.')
          ),
      }
    );
  };

  const handleDecline = (request: IFriendRequest) => {
    setActionError(undefined);
    declineMutation.mutate(
      { requestId: request.id },
      {
        onError: (error) =>
          setActionError(
            getFriendsApiErrorMessage(error, 'The friend invite could not be declined.')
          ),
      }
    );
  };

  const handleCancel = (request: IFriendRequest) => {
    setActionError(undefined);
    cancelMutation.mutate(
      { requestId: request.id },
      {
        onError: (error) =>
          setActionError(
            getFriendsApiErrorMessage(error, 'The sent invite could not be cancelled.')
          ),
      }
    );
  };

  const handleConfirmRemove = () => {
    if (!selectedFriend) return;

    setActionError(undefined);
    removeMutation.mutate(
      { friendUserId: selectedFriend.id },
      {
        onSuccess: () => setSelectedFriend(null),
        onError: (error) =>
          setActionError(getFriendsApiErrorMessage(error, 'The friend could not be removed.')),
      }
    );
  };

  const friendsCount = friendsFirstPage?.pagination.total ?? 0;
  const pendingCount =
    receivedFirstPage?.pendingReceivedCount ?? receivedFirstPage?.pagination.total ?? 0;

  const acceptingRequestId = acceptMutation.isPending
    ? acceptMutation.variables?.requestId
    : undefined;
  const decliningRequestId = declineMutation.isPending
    ? declineMutation.variables?.requestId
    : undefined;
  const cancellingRequestId = cancelMutation.isPending
    ? cancelMutation.variables?.requestId
    : undefined;
  const removingFriendId = removeMutation.isPending
    ? removeMutation.variables?.friendUserId
    : undefined;

  return (
    <FriendsAppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-7 pb-24 sm:px-6 min-[901px]:pb-8">
        <FriendsHeader
          title="Friends"
          description="Manage your friends, received invites, and the invitations you have sent."
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {activeTab === 'friends' && (
            <div className="min-w-0 flex-1">
              <FriendsSearchInput
                value={friendSearch}
                onChange={setFriendSearch}
                onClear={() => setFriendSearch('')}
                placeholder="Search your friends..."
                ariaLabel="Search your friends"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate(ROUTES.friendsSearch)}
            className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-(--brand-500) px-5 py-3 text-[12px] font-bold text-white transition hover:-translate-y-px hover:bg-(--brand-600) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-500)/30 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600) ${activeTab === 'requests' ? 'sm:ml-auto' : ''}`}
          >
            <UserPlusIcon />
            Find friends
          </button>
        </div>

        <FriendsTabs
          activeTab={activeTab}
          friendsCount={friendsCount}
          pendingCount={pendingCount}
          onChange={changeTab}
        />

        <FriendsActionError message={actionError} />

        {activeTab === 'friends' ? (
          friendsQuery.isPending ? (
            <FriendsListSkeleton />
          ) : friendsQuery.isError ? (
            <FriendsErrorState
              message={friendsQuery.error?.response?.data?.message}
              onRetry={() => void friendsQuery.refetch()}
            />
          ) : (
            <FriendsListView
              friends={friends}
              search={debouncedSearch}
              total={friendsCount}
              hasMore={Boolean(friendsQuery.hasNextPage)}
              loadingMore={friendsQuery.isFetchingNextPage}
              {...(removingFriendId ? { removingFriendId } : {})}
              onRemove={setSelectedFriend}
              onLoadMore={() => void friendsQuery.fetchNextPage()}
            />
          )
        ) : receivedQuery.isPending || sentQuery.isPending ? (
          <FriendsRequestsSkeleton />
        ) : receivedQuery.isError || sentQuery.isError ? (
          <FriendsErrorState
            message={
              receivedQuery.error?.response?.data?.message ??
              sentQuery.error?.response?.data?.message
            }
            onRetry={() => {
              void receivedQuery.refetch();
              void sentQuery.refetch();
            }}
          />
        ) : (
          <FriendRequestsView
            received={received}
            sent={sent}
            receivedTotal={receivedFirstPage?.pagination.total ?? 0}
            sentTotal={sentFirstPage?.pagination.total ?? 0}
            receivedHasMore={Boolean(receivedQuery.hasNextPage)}
            sentHasMore={Boolean(sentQuery.hasNextPage)}
            loadingMoreReceived={receivedQuery.isFetchingNextPage}
            loadingMoreSent={sentQuery.isFetchingNextPage}
            {...(acceptingRequestId ? { acceptingRequestId } : {})}
            {...(decliningRequestId ? { decliningRequestId } : {})}
            {...(cancellingRequestId ? { cancellingRequestId } : {})}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onCancel={handleCancel}
            onLoadMoreReceived={() => void receivedQuery.fetchNextPage()}
            onLoadMoreSent={() => void sentQuery.fetchNextPage()}
          />
        )}
      </div>

      <RemoveFriendDialog
        friend={selectedFriend}
        removing={removeMutation.isPending}
        onCancel={() => {
          if (!removeMutation.isPending) setSelectedFriend(null);
        }}
        onConfirm={handleConfirmRemove}
      />
    </FriendsAppShell>
  );
}
