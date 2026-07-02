import type { FriendUser } from "../types/friends.types";
import FriendCard from "./FriendCard";
import { FriendsEmptyState, FriendsLoadMoreButton } from "./FriendsStates";

interface FriendsListViewProps {
  friends: FriendUser[];
  search: string;
  total: number;
  hasMore: boolean;
  loadingMore: boolean;
  removingFriendId?: string;
  onRemove: (friend: FriendUser) => void;
  onLoadMore: () => void;
}

export default function FriendsListView({
  friends,
  search,
  total,
  hasMore,
  loadingMore,
  removingFriendId,
  onRemove,
  onLoadMore,
}: FriendsListViewProps) {
  if (friends.length === 0) {
    return (
      <FriendsEmptyState
        title={search ? "No matching friends" : "No friends yet"}
        message={
          search
            ? "Try searching with another name or username."
            : "Search for people you know and send them a friend invite to get started."
        }
      />
    );
  }

  return (
    <section className="space-y-4" aria-label="Friends list">
      <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#9b9a92]">
        Showing {friends.length} of {total}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {friends.map((friend) => (
          <FriendCard
            key={friend.id}
            friend={friend}
            removing={removingFriendId === friend.id}
            onRemove={onRemove}
          />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center pt-1">
          <FriendsLoadMoreButton
            loading={loadingMore}
            onClick={onLoadMore}
            label="Load more friends"
          />
        </div>
      )}
    </section>
  );
}
