import type { IDashboardRecentBattle } from '../types/dashboard.types';
import { cn } from '../utils/cn';
import { formatRelativeTime } from '../utils/dashboard-formatters';
import EmptyCard from './EmptyCard';
import UserAvatar from '../../../../components/data-display/UserAvatar';

type RecentBattlesProps = {
  battles: IDashboardRecentBattle[];
};

export default function RecentBattles({ battles }: RecentBattlesProps) {
  return (
    <section>
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="font-ui text-[clamp(20px,3vw,24px)] font-extrabold tracking-[-0.4px] text-(--text-primary) dark:text-(--text-primary)">
          Recent Battles
        </h2>
      </div>

      {battles.length === 0 ? (
        <EmptyCard
          title="No battles completed yet"
          description="Your recent challenge battles will appear here once completed."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {battles.map((battle) => (
            <div
              key={battle._id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-5 py-4 shadow-(--shadow-1) transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.20)] hover:shadow-(--shadow-2) dark:border-(--border-subtle) dark:bg-(--surface-card)"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-[1.5px] border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
                ⚔️
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-bold text-(--text-primary) dark:text-(--text-primary)">
                  Battle vs {battle.opponent?.fullName ?? 'Unknown Opponent'}
                </div>
                <div className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-(--text-secondary) opacity-55 dark:text-(--text-secondary)">
                  Completed {formatRelativeTime(battle.completedAt)}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <UserAvatar
                    name={battle.opponent?.fullName ?? 'Unknown Opponent'}
                    src={battle.opponent?.avatarUrl}
                    {...(battle.opponent?.username
                      ? { profileUsername: battle.opponent.username }
                      : {})}
                    sizeClassName="h-6 w-6 text-[8px]"
                    fallbackClassName="from-(--info) to-[#7aa4e8]"
                  />

                  <span className="text-[12.5px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
                    @{battle.opponent?.username ?? 'unknown'}
                  </span>
                </div>

                <span
                  className={cn(
                    'rounded-full border px-3 py-1 font-mono text-[8.5px] uppercase tracking-[0.12em]',
                    battle.result === 'win' &&
                      'border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.10)] text-(--success) dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-(--success)',
                    battle.result === 'loss' &&
                      'border-[rgba(200,50,50,0.22)] bg-[rgba(200,50,50,0.10)] text-[#b83232] dark:border-[rgba(220,80,80,0.22)] dark:bg-[rgba(220,80,80,0.10)] dark:text-(--danger)',
                    battle.result === 'draw' &&
                      'border-(--border-subtle) bg-[rgba(26,23,20,0.05)] text-(--text-secondary) dark:border-(--border-subtle) dark:bg-white/6 dark:text-(--text-secondary)'
                  )}
                >
                  {battle.result}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
