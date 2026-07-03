import StatCard, {
  type StatAccent,
} from '../../../components/data-display/StatCard'
import StatGrid from '../../../components/data-display/StatGrid'
import type { MockTestSummary } from '../types/mock-tests.types'

const ACCENTS: StatAccent[] = [
  { light: 'var(--brand-500)', dark: 'var(--brand-500)' },
  { light: 'var(--info)', dark: 'var(--info)' },
  { light: 'var(--success)', dark: 'var(--success)' },
  { light: 'var(--warning)', dark: 'var(--warning)' },
]

export function MockTestStatsGrid({ summary }: { summary: MockTestSummary }) {
  const cards = [
    {
      label: 'Total tests',
      value: summary.totalTests,
      helper: `${summary.totalQuestions} questions created`,
    },
    {
      label: 'Average',
      value: `${summary.averageScore}%`,
      helper: 'Across completed attempts',
    },
    {
      label: 'Best score',
      value: `${summary.bestScore}%`,
      helper: 'Your peak test result',
    },
    {
      label: 'Passed',
      value: summary.passedAttempts,
      helper: `${summary.completedAttempts} completed attempts`,
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

export default MockTestStatsGrid
