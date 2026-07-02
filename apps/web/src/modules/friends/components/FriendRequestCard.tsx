import type { FriendRequest } from "../types/friends.types";
import {
  formatMutualFriends,
  formatRequestTime,
} from "../utils/friends-formatters";
import FriendsAvatar from "./FriendsAvatar";
import { CheckIcon, CloseIcon, SpinnerIcon } from "./icons/FriendsIcons";

interface FriendRequestCardProps {
  request: FriendRequest;
  accepting?: boolean;
  declining?: boolean;
  cancelling?: boolean;
  onAccept?: (request: FriendRequest) => void;
  onDecline?: (request: FriendRequest) => void;
  onCancel?: (request: FriendRequest) => void;
}

export default function FriendRequestCard({
  request,
  accepting = false,
  declining = false,
  cancelling = false,
  onAccept,
  onDecline,
  onCancel,
}: FriendRequestCardProps) {
  const busy = accepting || declining || cancelling;

  return (
    <article className="flex flex-col gap-4 rounded-[18px] border border-[#e8ddd6] bg-white/55 p-4 sm:flex-row sm:items-center dark:border-white/8 dark:bg-white/3">
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <FriendsAvatar
          fullName={request.user.fullName}
          {...(request.user.avatarUrl !== undefined
            ? { avatarUrl: request.user.avatarUrl }
            : {})}
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
            {request.user.fullName}
          </p>
          <p className="truncate text-[11.5px] text-[#9b9a92]">
            {request.user.handle}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[rgba(184,76,43,0.08)] px-2 py-0.5 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#b84c2b] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
              {request.user.levelLabel}
            </span>
            {request.user.mutualCount > 0 && (
              <span className="font-['DM_Mono',monospace] text-[9.5px] text-[#9b9a92]">
                {formatMutualFriends(request.user.mutualCount)}
              </span>
            )}
            <span className="font-['DM_Mono',monospace] text-[9px] text-[#9b9a92]">
              {formatRequestTime(request.createdAt)}
            </span>
          </div>
          {request.message && (
            <p className="mt-2 line-clamp-2 text-[11.5px] italic leading-5 text-[#6b5f58] dark:text-[#9b9a92]">
              “{request.message}”
            </p>
          )}
        </div>
      </div>

      {request.direction === "received" ? (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onDecline?.(request)}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-[#e0d0c5] px-3.5 py-2 text-[11.5px] font-bold text-[#6b5f58] transition hover:border-[rgba(184,76,43,0.25)] hover:text-[#b84c2b] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
          >
            {declining ? (
              <SpinnerIcon className="animate-spin" />
            ) : (
              <CloseIcon />
            )}
            {declining ? "Declining…" : "Decline"}
          </button>
          <button
            type="button"
            onClick={() => onAccept?.(request)}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#b84c2b] px-3.5 py-2 text-[11.5px] font-bold text-white transition hover:bg-[#963d22] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
          >
            {accepting ? (
              <SpinnerIcon className="animate-spin" />
            ) : (
              <CheckIcon />
            )}
            {accepting ? "Accepting…" : "Accept"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onCancel?.(request)}
          disabled={busy}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-[#e0d0c5] px-4 py-2 text-[11.5px] font-bold text-[#6b5f58] transition hover:border-[rgba(184,76,43,0.25)] hover:bg-[rgba(184,76,43,0.07)] hover:text-[#b84c2b] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
        >
          {cancelling && <SpinnerIcon className="animate-spin" />}
          {cancelling ? "Cancelling…" : "Cancel invite"}
        </button>
      )}
    </article>
  );
}
