import StatCard, {
  type StatAccent,
} from '../../../components/data-display/StatCard'
import StatGrid from '../../../components/data-display/StatGrid'
import { formatCompactNumber } from '../utils/dashboard-formatters'

type DashboardStatsGridProps = {
  summary: {
    trackers: { total: number; active: number; completed: number }
    stats: { totalSubtopicsCompleted: number; publishedTrackers: number }
    user: { coinBalance: number }
  }
}

const ACCENTS: StatAccent[] = [
  { light: '#b84c2b', dark: '#e8816a' },
  { light: '#2d6a47', dark: '#3dbf82' },
  { light: '#c98000', dark: '#f0a832' },
  { light: '#3b6cb7', dark: '#4a9eff' },
]

export default function DashboardStatsGrid({ summary }: DashboardStatsGridProps) {
  const cards = [
    {
      label: 'Total Trackers',
      value: formatCompactNumber(summary.trackers.total),
      helper: `${summary.trackers.active} active trackers`,
    },
    {
      label: 'Completed',
      value: formatCompactNumber(summary.trackers.completed),
      helper: 'Roadmaps finished',
    },
    {
      label: 'Subtopics Done',
      value: formatCompactNumber(summary.stats.totalSubtopicsCompleted),
      helper: 'Across all trackers',
    },
    {
      label: 'Coins',
      value: formatCompactNumber(summary.user.coinBalance),
      helper: 'Rewards balance',
    },
  ]

  return (
    <StatGrid>
      {cards.map((card, index) => (
        <StatCard key={card.label} {...card} accent={ACCENTS[index]} />
      ))}
    </StatGrid>
  )
}
