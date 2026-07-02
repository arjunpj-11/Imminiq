import StatCard from '../../../components/data-display/StatCard'
import { cn } from '../../../lib/cn'
import type { ProfileStats, StreakSummary } from '../types/profile.types'
import { formatCompactNumber } from '../utils/profile-formatters'

interface ProfileStatsGridProps {
  stats?: ProfileStats | null
  streak?: StreakSummary | null
}

export default function ProfileStatsGrid({
  stats,
  streak,
}: ProfileStatsGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2.5 animate-[fadeUp_0.38s_ease_0.1s_both] max-[860px]:grid-cols-2 max-[420px]:grid-cols-1">
      <StatCard tone="rust" label="">
        <div className="font-['Playfair_Display',serif] text-[clamp(28px,4vw,36px)] font-extrabold leading-none tracking-[-2px] text-[#b84c2b] dark:text-[#e8816a]">
          {streak?.currentStreak ?? stats?.streakCount ?? 0}{' '}
          <span className="font-['DM_Sans',sans-serif] text-[14px] font-medium opacity-60">
            days
          </span>
        </div>
        <div className="mt-1 flex h-8 items-end gap-0.75">
          {[20, 55, 35, 80, 60, 90, 100, 70, 85, 50, 95, 42].map(
            (height, index) => (
              <div
                key={index}
                className={cn(
                  'flex-1 rounded-sm bg-[#b84c2b] dark:bg-[#e8816a]',
                  index === 11 ? 'opacity-70' : 'opacity-18',
                )}
                style={{ height: `${height}%` }}
              />
            ),
          )}
        </div>
      </StatCard>

      <StatCard tone="green" label="">
        <div className="flex items-baseline gap-2">
          <div className="font-['Playfair_Display',serif] text-[clamp(28px,4vw,36px)] font-extrabold leading-none tracking-[-2px] text-[#4caf7d] dark:text-[#5cc98a]">
            {stats?.studentLevel ?? 0}
          </div>
          <div className="font-['DM_Mono',monospace] text-[11px] tracking-[0.06em] text-[#4caf7d] opacity-80 dark:text-[#5cc98a]">
            Level
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-[10px] border border-[rgba(45,106,71,0.16)] bg-[rgba(45,106,71,0.06)] px-2.5 py-2 dark:border-[rgba(92,201,138,0.18)] dark:bg-[rgba(92,201,138,0.08)]">
          <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#6b5f58] opacity-60 dark:text-[#9b9a92]">
            Experience
          </span>
          <span className="font-['DM_Mono',monospace] text-[10px] font-medium text-[#4caf7d] dark:text-[#5cc98a]">
            {formatCompactNumber(stats?.xp ?? 0)} XP
          </span>
        </div>
      </StatCard>

      <StatCard tone="amber" label="">
        <div className="flex items-baseline gap-2">
          <div className="font-['Playfair_Display',serif] text-[clamp(28px,4vw,36px)] font-extrabold leading-none tracking-[-2px] text-[#c98000] dark:text-[#f0a842]">
            {formatCompactNumber(stats?.coins ?? 0)}
          </div>
          <div className="font-['DM_Mono',monospace] text-[11px] tracking-[0.06em] text-[#c98000] opacity-80 dark:text-[#f0a842]">
            Coins
          </div>
        </div>
        <div className="mt-2 rounded-[10px] border border-[rgba(138,98,0,0.18)] bg-[rgba(138,98,0,0.06)] px-2.5 py-2 text-[11px] font-medium leading-[1.35] text-[#6b5f58] dark:border-[rgba(240,168,66,0.20)] dark:bg-[rgba(240,168,66,0.08)] dark:text-[#9b9a92]">
          Reward balance available for store and powerups.
        </div>
      </StatCard>

      <StatCard tone="blue" label="">
        <div className="mt-1 grid grid-cols-2 gap-2">
          {[
            {
              value: formatCompactNumber(stats?.publishedCount ?? 0),
              label: 'Published',
            },
            {
              value: formatCompactNumber(stats?.cloneCount ?? 0),
              label: 'Clones',
            },
            {
              value: Number(stats?.ratingAverage ?? 0).toFixed(1),
              label: 'Rating',
              className: 'text-[#c98000] dark:text-[#f0a842]',
            },
            {
              value: formatCompactNumber(stats?.likeCount ?? 0),
              label: 'Likes',
              className: 'text-[#b84c2b] dark:text-[#e8816a]',
            },
          ].map((item) => (
            <div key={item.label}>
              <div
                className={cn(
                  'font-["Playfair_Display",serif] text-[20px] font-extrabold leading-none tracking-[-1px] text-[#1a1714] dark:text-[#f2f0eb]',
                  item.className,
                )}
              >
                {item.value}
              </div>
              <div className="mt-px font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </StatCard>
    </div>
  )
}
