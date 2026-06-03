// ============================================================
// MockTestStatsGrid.tsx — aligned with Trackers stat card style
// ============================================================
import type { MockTestSummary } from '../types/mock-tests.types'

const ACCENT_COLORS = [
  '#e8816a', // coral — Total
  '#4a9eff', // blue  — Average
  '#3dbf82', // green — Best score
  '#f0a832', // amber — Passed
]

const StatCard = ({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string | number
  hint: string
  accent: string
}) => (
  <div
    className="relative rounded-2xl border border-white/10 bg-[#1c1a18] p-5 dark:border-white/10 dark:bg-[#1c1a18]"
    style={{ borderTop: `2.5px solid ${accent}` }}
  >
    <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#9b9a92]">
      {label}
    </div>
    <div className="mt-4 font-['Playfair_Display',serif] text-[34px] font-black leading-none text-[#f2f0eb]">
      {value}
    </div>
    <p className="mt-3 text-[12px] text-[#6b6560]">{hint}</p>
  </div>
)

export function MockTestStatsGrid({ summary }: { summary: MockTestSummary }) {
  const cards = [
    { label: 'Total tests',  value: summary.totalTests,                     hint: `${summary.totalQuestions} questions created` },
    { label: 'Average',      value: `${summary.averageScore}%`,             hint: 'Across completed attempts'                   },
    { label: 'Best score',   value: `${summary.bestScore}%`,                hint: 'Your peak test result'                       },
    { label: 'Passed',       value: summary.passedAttempts,                 hint: `${summary.completedAttempts} completed attempts` },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => (
        <StatCard key={card.label} {...card} accent={ACCENT_COLORS[i]} />
      ))}
    </div>
  )
}

export default MockTestStatsGrid