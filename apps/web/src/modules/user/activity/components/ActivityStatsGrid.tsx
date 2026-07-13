import StatCard from '../../../../components/data-display/StatCard'
import StatGrid from '../../../../components/data-display/StatGrid'
import type { IActivityPageResponse } from '../types/activity.types'
import { formatCompactNumber } from '../utils/activity-formatters'
import { ACTIVITY_STAT_ACCENTS } from '../utils/activity-ui'

interface IActivityStatsGridProps {
  stats: IActivityPageResponse['stats']
}

export default function ActivityStatsGrid({ stats }: IActivityStatsGridProps) {
  const cards = [
    {
      label: 'Total XP',
      value: formatCompactNumber(stats.totalXp),
      helper: `${formatCompactNumber(stats.learningXp)} learning · ${formatCompactNumber(stats.teacherXp)} teacher · ${formatCompactNumber(stats.coins)} coins`,
    },
    {
      label: 'Sessions',
      value: formatCompactNumber(stats.sessions),
      helper: 'Learning sessions recorded',
    },
    {
      label: 'Subtopics Done',
      value: formatCompactNumber(stats.subtopicsDone),
      helper: 'Across all trackers',
    },
    {
      label: 'Tests Attempted',
      value: formatCompactNumber(stats.testsAttempted),
      helper: `${formatCompactNumber(stats.totalQuestions)} questions total`,
    },
  ]

  return (
    <StatGrid>
      {cards.map((card, index) => (
        <StatCard
          key={card.label}
          {...card}
          accent={
            ACTIVITY_STAT_ACCENTS[index % ACTIVITY_STAT_ACCENTS.length] ??
            ACTIVITY_STAT_ACCENTS[0]
          }
        />
      ))}
    </StatGrid>
  )
}
