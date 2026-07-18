import type { IDashboardFriend } from '../types/dashboard.types';
import { cn } from '../utils/cn';
import { formatRelativeTime } from '../utils/dashboard-formatters';
import EmptyCard from './EmptyCard';
import UserAvatar from '../../../../components/data-display/UserAvatar';

type FriendsCardProps = {
  friends: IDashboardFriend[];
  onOpenFriends: () => void;
  onOpenProfile: (username: string) => void;
};

export default function FriendsCard({ friends, onOpenFriends, onOpenProfile }: FriendsCardProps) {
  const onlineCount = friends.filter((friend) => friend.isOnline).length;

  return (
    <section className="flex flex-col gap-4 rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-ui text-[18px] font-extrabold tracking-[-0.3px] text-(--text-primary) dark:text-(--text-primary)">
          Friends Hub
        </h2>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-2.5 py-1 font-mono text-[8.5px] uppercase tracking-widest text-(--success) dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-(--success)">
          <span className="h-1.25 w-1.25 rounded-full bg-(--success) dark:bg-(--success)" />
          {onlineCount} online
        </span>
      </div>

      {friends.length === 0 ? (
        <EmptyCard
          title="No friends yet"
          description="Connect with other learners to see their activity here."
        />
      ) : (
        <div className="flex flex-col gap-1">
          {friends.map((friend) => (
            <div
              key={friend._id}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2.25 transition hover:bg-[rgba(184,76,43,0.04)] dark:hover:bg-[rgba(232,129,106,0.05)]"
            >
              <button
                type="button"
                onClick={() => onOpenProfile(friend.username)}
                aria-label={`Open ${friend.fullName}'s profile`}
                className="relative shrink-0 rounded-full transition hover:ring-2 hover:ring-(--brand-500)/30"
              >
                <UserAvatar
                  name={friend.fullName}
                  src={friend.avatarUrl}
                  sizeClassName="h-8.5 w-8.5 text-[11px]"
                />

                <span
                  className={cn(
                    'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#fdf8f5] dark:border-[#1e1c19]',
                    friend.isOnline ? 'bg-(--success)' : 'bg-[#6b5f58]/50 dark:bg-[#9b9a92]/50'
                  )}
                />
              </button>

              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
                  {friend.fullName}
                </div>
                <div className="truncate text-[11px] text-(--text-secondary) dark:text-(--text-secondary)">
                  @{friend.username} ·{' '}
                  {friend.isOnline ? 'Online now' : formatRelativeTime(friend.lastActiveAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onOpenFriends}
        className="rounded-md border-[1.5px] border-(--border-subtle) px-4 py-2.5 text-[13px] font-semibold text-(--text-secondary) transition hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
      >
        View Friends
      </button>
    </section>
  );
}
