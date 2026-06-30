import type { ActivityPageResponse } from '../types/activity.types'
import { formatCompactNumber } from '../utils/activity-formatters'
import { ACTIVITY_STAT_ACCENTS } from '../utils/activity-ui'

interface StatCardProps {
  label: string
  value: string
  hint: string
  accent: {
    light: string
    dark: string
  }
}

const StatCard = ({
  label,
  value,
  hint,
  accent,
}: StatCardProps) => (
  <div className="group relative overflow-hidden rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.20)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/10 dark:bg-[#1c1a18] dark:hover:border-white/20">
    <div
      className="absolute inset-x-0 top-0 h-[2.5px] dark:hidden"
      style={{
        background: `linear-gradient(90deg, transparent, ${accent.light}, transparent)`,
      }}
    />
    <div
      className="absolute inset-x-0 top-0 hidden h-[2.5px] dark:block"
      style={{
        background: `linear-gradient(90deg, transparent, ${accent.dark}, transparent)`,
      }}
    />

    <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-70 dark:text-[#9b9a92]">
      {label}
    </div>
    <div className="mt-4 font-['Playfair_Display',serif] text-[30px] font-black leading-none tracking-[-1.5px] text-[#1a1714] sm:text-[34px] dark:text-[#f2f0eb]">
      {value}
    </div>
    <p className="mt-3 text-[12px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
      {hint}
    </p>
  </div>
)

interface ActivityStatsGridProps {
  stats: ActivityPageResponse['stats']
}

export default function ActivityStatsGrid({
  stats,
}: ActivityStatsGridProps) {
  const cards = [
    {
      label: 'Total XP',
      value: formatCompactNumber(stats.totalXp),
      hint: `${formatCompactNumber(stats.learningXp)} learning · ${formatCompactNumber(stats.teacherXp)} teacher · ${formatCompactNumber(stats.coins)} coins`,
    },
    {
      label: 'Sessions',
      value: formatCompactNumber(stats.sessions),
      hint: 'Learning sessions recorded',
    },
    {
      label: 'Subtopics Done',
      value: formatCompactNumber(stats.subtopicsDone),
      hint: 'Across all trackers',
    },
    {
      label: 'Tests Attempted',
      value: formatCompactNumber(stats.testsAttempted),
      hint: `${formatCompactNumber(stats.totalQuestions)} questions total`,
    },
  ]

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <StatCard
          key={card.label}
          {...card}
          accent={
            ACTIVITY_STAT_ACCENTS[
              index % ACTIVITY_STAT_ACCENTS.length
            ] ?? ACTIVITY_STAT_ACCENTS[0]
          }
        />
      ))}
    </section>
  )
}
