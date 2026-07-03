import type { FriendUser } from "../types/friends.types";
import FriendSearchResultCard from "./FriendSearchResultCard";
import { FriendsEmptyState, FriendsLoadMoreButton } from "./FriendsStates";

interface FriendSearchResultsProps {
  query: string;
  users: FriendUser[];
  total: number;
  hasMore: boolean;
  loadingMore: boolean;
  sendingUserId?: string;
  onSendRequest: (user: FriendUser) => void;
  onOpenRequests: () => void;
  onLoadMore: () => void;
}

export default function FriendSearchResults({
  query,
  users,
  total,
  hasMore,
  loadingMore,
  sendingUserId,
  onSendRequest,
  onOpenRequests,
  onLoadMore,
}: FriendSearchResultsProps) {
  if (!query) {
    return (
      <FriendsEmptyState
        title="Search for people"
        message="Type a name or username above to find learners to connect with."
      />
    );
  }

  if (users.length === 0) {
    return (
      <FriendsEmptyState
        title="No one found"
        message="Try searching with a different name or username."
      />
    );
  }

  return (
    <section aria-label="People search results">
      <p className="mb-3 text-[12px] text-[#9b9a92]">
        {total} result{total === 1 ? "" : "s"} for “{query}”
      </p>
      <div className="space-y-2.5">
        {users.map((user) => (
          <FriendSearchResultCard
            key={user.id}
            user={user}
            sending={sendingUserId === user.id}
            onSendRequest={onSendRequest}
            onOpenRequests={onOpenRequests}
          />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center pt-4">
          <FriendsLoadMoreButton
            loading={loadingMore}
            onClick={onLoadMore}
            label="Load more people"
          />
        </div>
      )}
    </section>
  );
}
