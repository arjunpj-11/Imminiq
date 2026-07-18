import { Link } from 'react-router-dom';
import type { IFriendRequest } from '../../types/friends.types';
import { formatMutualFriends, formatRequestTime } from '../../utils/friends-formatters';
import FriendsAvatar from '../shared/FriendsAvatar';
import { CheckIcon, CloseIcon, SpinnerIcon } from '../icons/FriendsIcons';

interface IFriendRequestCardProps {
  request: IFriendRequest;
  accepting?: boolean;
  declining?: boolean;
  cancelling?: boolean;
  onAccept?: (request: IFriendRequest) => void;
  onDecline?: (request: IFriendRequest) => void;
  onCancel?: (request: IFriendRequest) => void;
}

export default function FriendRequestCard({
  request,
  accepting = false,
  declining = false,
  cancelling = false,
  onAccept,
  onDecline,
  onCancel,
}: IFriendRequestCardProps) {
  const busy = accepting || declining || cancelling;

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-[#e8ddd6] bg-white/55 p-4 sm:flex-row sm:items-center dark:border-white/8 dark:bg-white/3">
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <Link
          to={`/profile/${request.user.username}`}
          aria-label={`Open ${request.user.fullName}'s profile`}
          className="inline-flex aspect-square shrink-0 items-center justify-center rounded-full leading-none transition hover:ring-2 hover:ring-(--brand-500)/30 hover:ring-offset-2 hover:ring-offset-(--surface-card) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-500) focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-card)"
        >
          <FriendsAvatar
            fullName={request.user.fullName}
            {...(request.user.avatarUrl !== undefined ? { avatarUrl: request.user.avatarUrl } : {})}
          />
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-bold text-(--text-primary) dark:text-(--text-primary)">
            {request.user.fullName}
          </p>
          <p className="truncate text-[11.5px] text-[#9b9a92]">{request.user.handle}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[rgba(184,76,43,0.08)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-(--brand-500) dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
              {request.user.levelLabel}
            </span>
            {request.user.mutualCount > 0 && (
              <span className="font-mono text-[9.5px] text-[#9b9a92]">
                {formatMutualFriends(request.user.mutualCount)}
              </span>
            )}
            <span className="font-mono text-[9px] text-[#9b9a92]">
              {formatRequestTime(request.createdAt)}
            </span>
          </div>
          {request.message && (
            <p className="mt-2 line-clamp-2 text-[11.5px] italic leading-5 text-(--text-secondary) dark:text-(--text-secondary)">
              “{request.message}”
            </p>
          )}
        </div>
      </div>

      {request.direction === 'received' ? (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onDecline?.(request)}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border-[1.5px] border-(--border-subtle) px-3.5 py-2 text-[11.5px] font-bold text-(--text-secondary) transition hover:border-[rgba(184,76,43,0.25)] hover:text-(--brand-500) disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
          >
            {declining ? <SpinnerIcon className="animate-spin" /> : <CloseIcon />}
            {declining ? 'Declining…' : 'Decline'}
          </button>
          <button
            type="button"
            onClick={() => onAccept?.(request)}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-(--brand-500) px-3.5 py-2 text-[11.5px] font-bold text-white transition hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
          >
            {accepting ? <SpinnerIcon className="animate-spin" /> : <CheckIcon />}
            {accepting ? 'Accepting…' : 'Accept'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onCancel?.(request)}
          disabled={busy}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border-[1.5px] border-(--border-subtle) px-4 py-2 text-[11.5px] font-bold text-(--text-secondary) transition hover:border-[rgba(184,76,43,0.25)] hover:bg-[rgba(184,76,43,0.07)] hover:text-(--brand-500) disabled:cursor-not-allowed disabled:opacity-50 dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
        >
          {cancelling && <SpinnerIcon className="animate-spin" />}
          {cancelling ? 'Cancelling…' : 'Cancel invite'}
        </button>
      )}
    </article>
  );
}
