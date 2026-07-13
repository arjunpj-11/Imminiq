import type { IAdaptiveHistoryEntry } from '../types/adaptive-learning.types'

interface IAdaptiveMasteryGraphProps {
  history: IAdaptiveHistoryEntry[]
}

export default function AdaptiveMasteryGraph({
  history,
}: IAdaptiveMasteryGraphProps) {
  const points = history.slice(-10)
  const width = 760
  const height = 180
  const padding = 18
  const xFor = (index: number) =>
    points.length <= 1
      ? width / 2
      : padding + (index / (points.length - 1)) * (width - padding * 2)
  const yFor = (score: number) =>
    height - padding - (score / 100) * (height - padding * 2)
  const polyline = points
    .map((point, index) => `${xFor(index)},${yFor(point.masteryScore)}`)
    .join(' ')

  return (
    <div className="overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1)">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--brand-500)">
            Adaptive mastery
          </p>
          <h2 className="mt-1 font-ui text-[19px] font-black text-(--text-primary)">
            Level movement
          </h2>
        </div>
        <p className="text-[12px] text-(--text-secondary)">
          Rises or falls against the agent's predicted exam score
        </p>
      </div>

      <svg
        className="mt-5 h-auto w-full"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Adaptive mastery history graph"
      >
        {[25, 50, 75].map((score) => (
          <line
            key={score}
            x1={padding}
            x2={width - padding}
            y1={yFor(score)}
            y2={yFor(score)}
            stroke="currentColor"
            className="text-(--border-subtle)"
            strokeDasharray="4 6"
          />
        ))}
        {points.length > 1 ? (
          <polyline
            points={polyline}
            fill="none"
            stroke="var(--brand-500)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {points.map((point, index) => (
          <circle
            key={point.id}
            cx={xFor(index)}
            cy={yFor(point.masteryScore)}
            r="6"
            fill={point.change < 0 ? '#dc5b55' : 'var(--brand-500)'}
          >
            <title>{`${point.masteryScore}% — ${point.reason}`}</title>
          </circle>
        ))}
      </svg>

      <div className="mt-2 flex justify-between text-[11px] text-(--text-secondary)">
        <span>{points[0]?.level ?? 'No assessments yet'}</span>
        <span>{points.at(-1)?.masteryScore ?? 0}% mastery</span>
      </div>
    </div>
  )
}
