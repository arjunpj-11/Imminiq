import StatCard from './StatCard'
import {
  formatCompactNumber,
  formatStudyMinutes,
} from '../utils/dashboard-formatters'

type DashboardStatsGridProps = {
  summary: {
    trackers: {
      total: number
      active: number
      completed: number
    }
    stats: {
      totalTimeSpentMinutes: number
    }
    user: {
      coinBalance: number
    }
  }
}

export default function DashboardStatsGrid({
  summary,
}: DashboardStatsGridProps) {
  return (
    <section className="grid grid-cols-4 gap-3 max-[860px]:grid-cols-2 max-[440px]:gap-2">
      <StatCard
        accent="rust"
        label="Total Trackers"
        value={formatCompactNumber(summary.trackers.total)}
        footer={
          <span className="inline-flex rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.08em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
            {summary.trackers.active} active
          </span>
        }
      />

      <StatCard
        accent="green"
        label="Completed"
        value={formatCompactNumber(summary.trackers.completed)}
        footer={
          <span className="inline-flex rounded-full border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-2.5 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.08em] text-[#2d6a47] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]">
            Roadmaps finished
          </span>
        }
      />

      <StatCard
        accent="amber"
        label="Study Time"
        value={formatStudyMinutes(summary.stats.totalTimeSpentMinutes)}
        footer={
          <span className="text-[11px] text-[#6b5f58] dark:text-[#9b9a92]">
            Across all trackers
          </span>
        }
      />

      <StatCard
        accent="blue"
        label="Coins"
        value={formatCompactNumber(summary.user.coinBalance)}
        footer={
          <span className="text-[11px] text-[#6b5f58] dark:text-[#9b9a92]">
            Rewards balance
          </span>
        }
      />
    </section>
  )
}
