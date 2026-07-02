import type { MouseEvent } from "react";

import type { FriendUser } from "../types/friends.types";
import FriendsAvatar from "./FriendsAvatar";
import { SpinnerIcon } from "./icons/FriendsIcons";

interface RemoveFriendDialogProps {
  friend: FriendUser | null;
  removing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function RemoveFriendDialog({
  friend,
  removing,
  onCancel,
  onConfirm,
}: RemoveFriendDialogProps) {
  if (!friend) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && !removing) {
          onCancel();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-friend-title"
        className="w-full max-w-md rounded-[20px] border border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-2xl dark:border-white/10 dark:bg-[#1e1c19]"
      >
        <div className="flex items-center gap-3">
          <FriendsAvatar
            fullName={friend.fullName}
            {...(friend.avatarUrl !== undefined
              ? { avatarUrl: friend.avatarUrl }
              : {})}
          />
          <div className="min-w-0">
            <h2
              id="remove-friend-title"
              className="font-['Playfair_Display',serif] text-[19px] font-extrabold"
            >
              Remove friend?
            </h2>
            <p className="truncate text-[12px] text-[#9b9a92]">
              {friend.fullName} · {friend.handle}
            </p>
          </div>
        </div>

        <p className="mt-4 text-[13px] leading-6 text-[#6b5f58] dark:text-[#9b9a92]">
          They will be removed from your friends list and from your Friends
          leaderboard audience. You can send another invite later.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={removing}
            className="rounded-[10px] border-[1.5px] border-[#e0d0c5] px-4 py-2.5 text-[12px] font-bold text-[#6b5f58] transition hover:text-[#b84c2b] disabled:opacity-50 dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
          >
            Keep friend
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={removing}
            className="inline-flex items-center gap-2 rounded-[10px] bg-[#d94535] px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#b9362b] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {removing && <SpinnerIcon className="animate-spin" />}
            {removing ? "Removing…" : "Remove friend"}
          </button>
        </div>
      </section>
    </div>
  );
}
