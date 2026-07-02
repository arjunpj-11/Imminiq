import type { FriendUser } from "../types/friends.types";
import { formatMutualFriends } from "../utils/friends-formatters";
import FriendsAvatar from "./FriendsAvatar";
import { MoreIcon, SpinnerIcon } from "./icons/FriendsIcons";

interface FriendCardProps {
  friend: FriendUser;
  removing: boolean;
  onRemove: (friend: FriendUser) => void;
}

export default function FriendCard({
  friend,
  removing,
  onRemove,
}: FriendCardProps) {
  return (
    <article className="flex min-w-0 items-center gap-3.5 rounded-[18px] border border-[#e8ddd6] bg-white/55 p-4 transition hover:border-[rgba(184,76,43,0.24)] hover:bg-white/75 dark:border-white/8 dark:bg-white/3 dark:hover:border-white/15 dark:hover:bg-white/5">
      <FriendsAvatar
        fullName={friend.fullName}
        {...(friend.avatarUrl !== undefined
          ? { avatarUrl: friend.avatarUrl }
          : {})}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
          {friend.fullName}
        </p>
        <p className="truncate text-[11.5px] text-[#9b9a92]">{friend.handle}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[rgba(184,76,43,0.08)] px-2 py-0.5 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#b84c2b] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
            {friend.levelLabel}
          </span>
          {friend.mutualCount > 0 && (
            <span className="font-['DM_Mono',monospace] text-[9.5px] text-[#9b9a92]">
              {formatMutualFriends(friend.mutualCount)}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(friend)}
        disabled={removing}
        aria-label={`Remove ${friend.fullName} from friends`}
        title="Remove friend"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border-[1.5px] border-[#e0d0c5] text-[#9b9a92] transition hover:border-[rgba(184,76,43,0.25)] hover:bg-[rgba(184,76,43,0.07)] hover:text-[#b84c2b] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/9 dark:hover:text-[#e8816a]"
      >
        {removing ? <SpinnerIcon className="animate-spin" /> : <MoreIcon />}
      </button>
    </article>
  );
}
