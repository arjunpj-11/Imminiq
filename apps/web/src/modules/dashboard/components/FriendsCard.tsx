import type { DashboardFriend } from '../types/dashboard.types'
import { cn } from '../utils/cn'
import { formatRelativeTime, getInitials } from '../utils/dashboard-formatters'
import EmptyCard from './EmptyCard'

type FriendsCardProps = {
  friends: DashboardFriend[]
  onOpenCommunity: () => void
}

export default function FriendsCard({
  friends,
  onOpenCommunity,
}: FriendsCardProps) {
  const onlineCount = friends.filter((friend) => friend.isOnline).length

  return (
    <section className="flex flex-col gap-4 rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-['Playfair_Display',serif] text-[18px] font-extrabold tracking-[-0.3px] text-[#1a1714] dark:text-[#f2f0eb]">
          Friends Hub
        </h2>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-2.5 py-1 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-widest text-[#4caf7d] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]">
          <span className="h-1.25 w-1.25 rounded-full bg-[#4caf7d] dark:bg-[#5cc98a]" />
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
              className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2.25 transition hover:bg-[rgba(184,76,43,0.04)] dark:hover:bg-[rgba(232,129,106,0.05)]"
            >
              <div className="relative flex h-8.5 w-8.5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-[#b84c2b] to-[#e8816a] text-[11px] font-bold text-white">
                {friend.avatarUrl ? (
                  <img
                    src={friend.avatarUrl}
                    alt={friend.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(friend.fullName)
                )}

                <span
                  className={cn(
                    'absolute bottom-px right-px h-2 w-2 rounded-full border-2 border-[#fdf8f5] dark:border-[#1e1c19]',
                    friend.isOnline
                      ? 'bg-[#4caf7d]'
                      : 'bg-[#6b5f58]/50 dark:bg-[#9b9a92]/50'
                  )}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                  {friend.fullName}
                </div>
                <div className="truncate text-[11px] text-[#6b5f58] dark:text-[#9b9a92]">
                  @{friend.username} ·{' '}
                  {friend.isOnline
                    ? 'Online now'
                    : formatRelativeTime(friend.lastActiveAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onOpenCommunity}
        className="rounded-[10px] border-[1.5px] border-[#e0d0c5] px-4 py-2.5 text-[13px] font-semibold text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
      >
        View Friends
      </button>
    </section>
  )
}
