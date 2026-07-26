import { Link } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { UserMinus } from 'lucide-react';
import type { IFriendUser } from '../../types/friends.types';
import { formatMutualFriends } from '../../utils/friends-formatters';
import FriendsAvatar from '../shared/FriendsAvatar';
import { MoreIcon, SpinnerIcon } from '../icons/FriendsIcons';

interface IFriendCardProps {
  friend: IFriendUser;
  removing: boolean;
  onRemove: (friend: IFriendUser) => void;
}

export default function FriendCard({ friend, removing, onRemove }: IFriendCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [menuOpen]);

  return (
    <article className="render-lazy flex min-w-0 items-center gap-3.5 rounded-lg border border-[#e8ddd6] bg-white/55 p-4 transition hover:border-[rgba(184,76,43,0.24)] hover:bg-white/75 dark:border-white/8 dark:bg-white/3 dark:hover:border-white/15 dark:hover:bg-white/5">
      <Link
        to={`/profile/${friend.username}`}
        aria-label={`Open ${friend.fullName}'s profile`}
        className="inline-flex aspect-square shrink-0 items-center justify-center rounded-full leading-none transition hover:ring-2 hover:ring-(--brand-500)/30 hover:ring-offset-2 hover:ring-offset-(--surface-card) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-500) focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-card)"
      >
        <FriendsAvatar
          fullName={friend.fullName}
          {...(friend.avatarUrl !== undefined ? { avatarUrl: friend.avatarUrl } : {})}
        />
      </Link>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-bold text-(--text-primary) dark:text-(--text-primary)">
          {friend.fullName}
        </p>
        <p className="truncate text-[11.5px] text-[#9b9a92]">{friend.handle}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[rgba(184,76,43,0.08)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-(--brand-500) dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
            {friend.levelLabel}
          </span>
          {friend.mutualCount > 0 && (
            <span className="font-mono text-[9.5px] text-[#9b9a92]">
              {formatMutualFriends(friend.mutualCount)}
            </span>
          )}
        </div>
      </div>

      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          disabled={removing}
          aria-label={`Manage friendship with ${friend.fullName}`}
          className="flex h-9 w-9 items-center justify-center rounded-md border-[1.5px] border-(--border-subtle) text-[#9b9a92] transition hover:border-[rgba(184,76,43,0.25)] hover:bg-[rgba(184,76,43,0.07)] hover:text-(--brand-500) disabled:cursor-not-allowed disabled:opacity-50 dark:border-(--border-subtle) dark:hover:text-(--brand-500)"
        >
          {removing ? <SpinnerIcon className="animate-spin" /> : <MoreIcon />}
        </button>
        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-11 z-30 w-40 rounded-xl border border-(--border-subtle) bg-(--surface-elevated) p-1.5 shadow-(--shadow-3)"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onRemove(friend);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[10px] font-bold text-(--danger) hover:bg-(--surface-muted)"
            >
              <UserMinus size={14} />
              Unfriend
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
