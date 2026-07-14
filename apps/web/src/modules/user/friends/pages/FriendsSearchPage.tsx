import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../../../routes/config/route-paths';

import FriendSearchResults from '../components/search/FriendSearchResults';
import FriendsAppShell from '../components/shared/FriendsAppShell';
import FriendsHeader from '../components/shared/FriendsHeader';
import FriendsSearchInput from '../components/search/FriendsSearchInput';
import {
  FriendsActionError,
  FriendsEmptyState,
  FriendsErrorState,
  FriendsListSkeleton,
} from '../components/shared/FriendsStates';
import { BackIcon } from '../components/icons/FriendsIcons';
import {
  FRIENDS_DEFAULT_PAGE_SIZE,
  FRIENDS_SEARCH_MIN_LENGTH,
} from '../constants/friends.constants';
import { useFriendSearch } from '../hooks/useFriendSearch';
import { useSendFriendRequest } from '../hooks/useSendFriendRequest';
import type { IFriendUser } from '../types/friends.types';
import {
  getFriendsApiErrorMessage,
  mergeFriendUserPages,
  normalizeSearchQuery,
} from '../utils/friends-formatters';

type FriendsSearchPageContentProps = {
  activeQuery: string;
};

function FriendsSearchPageContent({ activeQuery }: FriendsSearchPageContentProps) {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  /*
   * This state is initialized from the URL.
   *
   * The parent uses activeQuery as this component's key, so browser
   * back/forward navigation or a changed URL query remounts this
   * component with the new initial value. No synchronization effect
   * is required.
   */
  const [inputValue, setInputValue] = useState(activeQuery);
  const [actionError, setActionError] = useState<string>();

  const searchQuery = useFriendSearch({
    query: activeQuery,
    limit: FRIENDS_DEFAULT_PAGE_SIZE,
  });

  const sendMutation = useSendFriendRequest();

  const users = useMemo(
    () => mergeFriendUserPages(searchQuery.data?.pages ?? []),
    [searchQuery.data?.pages]
  );

  const firstPage = searchQuery.data?.pages[0];

  const handleSubmit = () => {
    const normalized = normalizeSearchQuery(inputValue);

    setActionError(undefined);

    if (!normalized) {
      setSearchParams({}, { replace: true });
      return;
    }

    setSearchParams(
      {
        q: normalized,
      },
      {
        replace: true,
      }
    );
  };

  const handleClear = () => {
    setInputValue('');
    setActionError(undefined);
    setSearchParams({}, { replace: true });
  };

  const handleSendRequest = (user: IFriendUser) => {
    setActionError(undefined);

    sendMutation.mutate(
      {
        receiverUserId: user.id,
      },
      {
        onError: (error) => {
          setActionError(getFriendsApiErrorMessage(error, 'The friend invite could not be sent.'));
        },
      }
    );
  };

  const sendingUserId = sendMutation.isPending ? sendMutation.variables?.receiverUserId : undefined;

  const queryTooShort = activeQuery.length > 0 && activeQuery.length < FRIENDS_SEARCH_MIN_LENGTH;

  return (
    <FriendsAppShell>
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-7 pb-24 sm:px-6 min-[901px]:pb-8">
        <button
          type="button"
          onClick={() => navigate(ROUTES.friends)}
          className="inline-flex w-fit items-center gap-2 rounded-md border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-4 py-2.5 text-[12px] font-bold text-(--text-secondary) transition hover:border-[rgba(184,76,43,0.25)] hover:bg-[rgba(184,76,43,0.07)] hover:text-(--brand-500) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-500)/20 dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
        >
          <BackIcon />
          Back to friends
        </button>

        <FriendsHeader
          title="Find people"
          description="Search learners by their name or username and send them a friend invite."
        />

        <FriendsSearchInput
          value={inputValue}
          onChange={setInputValue}
          onClear={handleClear}
          onSubmit={handleSubmit}
          placeholder="Search by name or username..."
          ariaLabel="Search people"
          submitDisabled={!inputValue.trim()}
          autoFocus
        />

        <FriendsActionError message={actionError} />

        <div aria-live="polite">
          {queryTooShort ? (
            <FriendsEmptyState
              title="Keep typing"
              message={`Enter at least ${FRIENDS_SEARCH_MIN_LENGTH} characters to search for people.`}
            />
          ) : !activeQuery ? (
            <FriendSearchResults
              query=""
              users={[]}
              total={0}
              hasMore={false}
              loadingMore={false}
              onSendRequest={handleSendRequest}
              onOpenRequests={() => navigate(`${ROUTES.friends}?tab=requests`)}
              onLoadMore={() => undefined}
            />
          ) : searchQuery.isPending ? (
            <FriendsListSkeleton count={5} />
          ) : searchQuery.isError ? (
            <FriendsErrorState
              message={searchQuery.error?.response?.data?.message}
              onRetry={() => {
                void searchQuery.refetch();
              }}
            />
          ) : (
            <FriendSearchResults
              query={activeQuery}
              users={users}
              total={firstPage?.pagination.total ?? 0}
              hasMore={Boolean(searchQuery.hasNextPage)}
              loadingMore={searchQuery.isFetchingNextPage}
              {...(sendingUserId
                ? {
                    sendingUserId,
                  }
                : {})}
              onSendRequest={handleSendRequest}
              onOpenRequests={() => navigate(`${ROUTES.friends}?tab=requests`)}
              onLoadMore={() => {
                void searchQuery.fetchNextPage();
              }}
            />
          )}
        </div>
      </div>
    </FriendsAppShell>
  );
}

export default function FriendsSearchPage() {
  const [searchParams] = useSearchParams();

  const activeQuery = normalizeSearchQuery(searchParams.get('q') ?? '');

  /*
   * Changing the URL query changes the key. React then creates fresh
   * input state using the new activeQuery value, avoiding setState
   * inside an effect.
   */
  return <FriendsSearchPageContent key={activeQuery} activeQuery={activeQuery} />;
}
