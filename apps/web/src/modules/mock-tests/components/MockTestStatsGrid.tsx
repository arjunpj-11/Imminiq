// ============================================================
// MockTestStatsGrid.tsx — aligned with Trackers stat card style
// ============================================================

import type { MockTestSummary } from '../types/mock-tests.types'

const ACCENT_COLORS = [
  {
    light: '#b84c2b',
    dark: '#e8816a',
  },
  {
    light: '#3b6cb7',
    dark: '#4a9eff',
  },
  {
    light: '#2d6a47',
    dark: '#3dbf82',
  },
  {
    light: '#c98000',
    dark: '#f0a832',
  },
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
  accent: {
    light: string
    dark: string
  }
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.20)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/10 dark:bg-[#1c1a18] dark:hover:border-white/20">
    <div
      className="absolute inset-x-0 top-0 h-[2.5px]"
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

    <div className="mt-4 font-['Playfair_Display',serif] text-[34px] font-black leading-none tracking-[-1.5px] text-[#1a1714] dark:text-[#f2f0eb]">
      {value}
    </div>

    <p className="mt-3 text-[12px] leading-normal text-[#6b5f58] dark:text-[#6b6560]">
      {hint}
    </p>
  </div>
)

export function MockTestStatsGrid({ summary }: { summary: MockTestSummary }) {
  const cards = [
    {
      label: 'Total tests',
      value: summary.totalTests,
      hint: `${summary.totalQuestions} questions created`,
    },
    {
      label: 'Average',
      value: `${summary.averageScore}%`,
      hint: 'Across completed attempts',
    },
    {
      label: 'Best score',
      value: `${summary.bestScore}%`,
      hint: 'Your peak test result',
    },
    {
      label: 'Passed',
      value: summary.passedAttempts,
      hint: `${summary.completedAttempts} completed attempts`,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <StatCard
          key={card.label}
          {...card}
          accent={ACCENT_COLORS[index]}
        />
      ))}
    </div>
  )
}

export default MockTestStatsGrid