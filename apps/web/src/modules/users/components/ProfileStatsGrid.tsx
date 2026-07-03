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
        <div className="font-ui text-[clamp(28px,4vw,36px)] font-extrabold leading-none tracking-[-2px] text-(--brand-500) dark:text-(--brand-500)">
          {streak?.currentStreak ?? stats?.streakCount ?? 0}{' '}
          <span className="font-ui text-[14px] font-medium opacity-60">
            days
          </span>
        </div>
        <div className="mt-1 flex h-8 items-end gap-0.75">
          {[20, 55, 35, 80, 60, 90, 100, 70, 85, 50, 95, 42].map(
            (height, index) => (
              <div
                key={index}
                className={cn(
                  'flex-1 rounded-sm bg-(--brand-500) dark:bg-(--brand-500)',
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
          <div className="font-ui text-[clamp(28px,4vw,36px)] font-extrabold leading-none tracking-[-2px] text-(--success) dark:text-(--success)">
            {stats?.studentLevel ?? 0}
          </div>
          <div className="font-mono text-[11px] tracking-[0.06em] text-(--success) opacity-80 dark:text-(--success)">
            Level
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-md border border-[rgba(45,106,71,0.16)] bg-[rgba(45,106,71,0.06)] px-2.5 py-2 dark:border-[rgba(92,201,138,0.18)] dark:bg-[rgba(92,201,138,0.08)]">
          <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-(--text-secondary) opacity-60 dark:text-(--text-secondary)">
            Experience
          </span>
          <span className="font-mono text-[10px] font-medium text-(--success) dark:text-(--success)">
            {formatCompactNumber(stats?.xp ?? 0)} XP
          </span>
        </div>
      </StatCard>

      <StatCard tone="amber" label="">
        <div className="flex items-baseline gap-2">
          <div className="font-ui text-[clamp(28px,4vw,36px)] font-extrabold leading-none tracking-[-2px] text-(--warning) dark:text-(--warning)">
            {formatCompactNumber(stats?.coins ?? 0)}
          </div>
          <div className="font-mono text-[11px] tracking-[0.06em] text-(--warning) opacity-80 dark:text-(--warning)">
            Coins
          </div>
        </div>
        <div className="mt-2 rounded-md border border-[rgba(138,98,0,0.18)] bg-[rgba(138,98,0,0.06)] px-2.5 py-2 text-[11px] font-medium leading-[1.35] text-(--text-secondary) dark:border-[rgba(240,168,66,0.20)] dark:bg-[rgba(240,168,66,0.08)] dark:text-(--text-secondary)">
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
              className: 'text-[var(--warning)] dark:text-[var(--warning)]',
            },
            {
              value: formatCompactNumber(stats?.likeCount ?? 0),
              label: 'Likes',
              className: 'text-[var(--brand-500)] dark:text-[var(--brand-500)]',
            },
          ].map((item) => (
            <div key={item.label}>
              <div
                className={cn(
                  'font-ui text-[20px] font-extrabold leading-none tracking-[-1px] text-(--text-primary) dark:text-(--text-primary)',
                  item.className,
                )}
              >
                {item.value}
              </div>
              <div className="mt-px font-mono text-[7.5px] uppercase tracking-[0.14em] text-(--text-secondary) opacity-50 dark:text-(--text-secondary)">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </StatCard>
    </div>
  )
}
