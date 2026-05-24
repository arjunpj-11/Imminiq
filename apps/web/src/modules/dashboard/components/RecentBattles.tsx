import type { DashboardRecentBattle } from '../types/dashboard.types'
import { cn } from '../utils/cn'
import { formatRelativeTime, getInitials } from '../utils/dashboard-formatters'
import EmptyCard from './EmptyCard'

type RecentBattlesProps = {
  battles: DashboardRecentBattle[]
}

export default function RecentBattles({ battles }: RecentBattlesProps) {
  return (
    <section>
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="font-['Playfair_Display',serif] text-[clamp(20px,3vw,24px)] font-extrabold tracking-[-0.4px] text-[#1a1714] dark:text-[#f2f0eb]">
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
              className="flex flex-wrap items-center gap-4 rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-5 py-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.20)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/9 dark:bg-[#1e1c19]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-[1.5px] border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                ⚔️
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                  Battle vs{' '}
                  {battle.opponent?.fullName ?? 'Unknown Opponent'}
                </div>
                <div className="mt-0.5 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.08em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
                  Completed {formatRelativeTime(battle.completedAt)}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-[#3b6cb7] to-[#7aa4e8] text-[8px] font-bold text-white">
                    {battle.opponent?.avatarUrl ? (
                      <img
                        src={battle.opponent.avatarUrl}
                        alt={battle.opponent.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(
                        battle.opponent?.fullName ?? 'Unknown Opponent'
                      )
                    )}
                  </div>

                  <span className="text-[12.5px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                    @{battle.opponent?.username ?? 'unknown'}
                  </span>
                </div>

                <span
                  className={cn(
                    'rounded-full border px-3 py-1 font-["DM_Mono",monospace] text-[8.5px] uppercase tracking-[0.12em]',
                    battle.result === 'win' &&
                      'border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.10)] text-[#2d6a47] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]',
                    battle.result === 'loss' &&
                      'border-[rgba(200,50,50,0.22)] bg-[rgba(200,50,50,0.10)] text-[#b83232] dark:border-[rgba(220,80,80,0.22)] dark:bg-[rgba(220,80,80,0.10)] dark:text-[#e05252]',
                    battle.result === 'draw' &&
                      'border-[#e0d0c5] bg-[rgba(26,23,20,0.05)] text-[#6b5f58] dark:border-white/9 dark:bg-white/6 dark:text-[#9b9a92]'
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
  )
}
