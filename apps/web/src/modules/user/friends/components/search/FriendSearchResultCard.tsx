import { Link } from 'react-router-dom';
import type { IFriendUser } from '../../types/friends.types';
import { formatMutualFriends } from '../../utils/friends-formatters';
import FriendsAvatar from '../shared/FriendsAvatar';
import { CheckIcon, ClockIcon, SpinnerIcon, UserPlusIcon } from '../icons/FriendsIcons';

interface IFriendSearchResultCardProps {
  user: IFriendUser;
  sending: boolean;
  onSendRequest: (user: IFriendUser) => void;
  onOpenRequests: () => void;
}

export default function FriendSearchResultCard({
  user,
  sending,
  onSendRequest,
  onOpenRequests,
}: IFriendSearchResultCardProps) {
  const relationship = user.relationship;

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-[#e8ddd6] bg-white/55 p-4 transition hover:border-[rgba(184,76,43,0.24)] hover:bg-white/75 min-[520px]:flex-row min-[520px]:items-center dark:border-white/8 dark:bg-white/3 dark:hover:border-white/15 dark:hover:bg-white/5">
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <Link
          to={`/profile/${user.username}`}
          aria-label={`Open ${user.fullName}'s profile`}
          className="shrink-0 rounded-full transition hover:ring-2 hover:ring-(--brand-500)/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-500)"
        >
          <FriendsAvatar
            fullName={user.fullName}
            {...(user.avatarUrl !== undefined ? { avatarUrl: user.avatarUrl } : {})}
          />
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-bold text-(--text-primary) dark:text-(--text-primary)">
            {user.fullName}
          </p>
          <p className="truncate text-[11.5px] text-[#9b9a92]">{user.handle}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[rgba(184,76,43,0.08)] px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest text-(--brand-500) dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
              {user.levelLabel}
            </span>
            {user.mutualCount > 0 && (
              <span className="font-mono text-[9.5px] text-[#9b9a92]">
                {formatMutualFriends(user.mutualCount)}
              </span>
            )}
          </div>
        </div>
      </div>

      {relationship.status === 'friends' ? (
        <span className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border-[1.5px] border-[rgba(45,106,71,0.25)] bg-[rgba(45,106,71,0.08)] px-3.5 py-2 text-[11.5px] font-bold text-(--success) dark:text-(--success)">
          <CheckIcon />
          Friends
        </span>
      ) : relationship.status === 'pending' && relationship.direction === 'received' ? (
        <button
          type="button"
          onClick={onOpenRequests}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border-[1.5px] border-(--border-subtle) px-3.5 py-2 text-[11.5px] font-bold text-(--text-secondary) transition hover:border-[rgba(184,76,43,0.25)] hover:text-(--brand-500) dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
        >
          <ClockIcon />
          Review invite
        </button>
      ) : relationship.status === 'pending' ? (
        <span className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border-[1.5px] border-(--border-subtle) px-3.5 py-2 text-[11.5px] font-bold text-[#9b9a92] dark:border-(--border-subtle)">
          <ClockIcon />
          Pending
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onSendRequest(user)}
          disabled={sending}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-(--brand-500) px-3.5 py-2 text-[11.5px] font-bold text-white transition hover:-translate-y-px hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-55 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
        >
          {sending ? <SpinnerIcon className="animate-spin" /> : <UserPlusIcon />}
          {sending ? 'Sending…' : 'Add Friend'}
        </button>
      )}
    </article>
  );
}
