// CurrentRoadmapCard.tsx
import EmptyCard from './EmptyCard'
import { formatRelativeTime } from '../utils/dashboard-formatters'

type CurrentRoadmap = {
  _id: string
  title: string
  level: string
  lastStudiedAt?: string | Date | null
  completionPercentage?: number | null
  totalTopics?: number | null
  completedTopics?: number | null
  remainingTopics?: number | null
  estimatedHours?: number | null
}

type CurrentRoadmapCardProps = {
  currentRoadmap?: CurrentRoadmap | null
  onNavigate: (link: string) => void
}

const LEVEL_CONFIG: Record<string, { emoji: string; color: string; bg: string; darkColor: string; darkBg: string }> = {
  beginner:     { emoji: '🌱', color: '#2d6a47', bg: 'rgba(45,106,71,0.08)',   darkColor: '#5cc98a', darkBg: 'rgba(92,201,138,0.10)' },
  intermediate: { emoji: '⚡', color: '#b84c2b', bg: 'rgba(184,76,43,0.08)',  darkColor: '#e8816a', darkBg: 'rgba(232,129,106,0.10)' },
  advanced:     { emoji: '🔥', color: '#7c5a1e', bg: 'rgba(124,90,30,0.08)',  darkColor: '#d4a84b', darkBg: 'rgba(212,168,75,0.10)' },
}

function getMilestones(progress: number) {
  return [25, 50, 75, 100].map((m) => ({
    value: m,
    reached: progress >= m,
  }))
}

export default function CurrentRoadmapCard({
  currentRoadmap,
  onNavigate,
}: CurrentRoadmapCardProps) {
  const progress = currentRoadmap?.completionPercentage ?? 0
  const levelKey = currentRoadmap?.level?.toLowerCase() ?? 'beginner'
  const levelCfg = LEVEL_CONFIG[levelKey] ?? LEVEL_CONFIG.beginner
  const milestones = getMilestones(progress)

  return (
    <div className="relative overflow-hidden self-start rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19] max-[640px]:p-4">

      {/* Subtle radial glow top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full opacity-30 dark:opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(184,76,43,0.18) 0%, transparent 70%)' }}
      />

      {currentRoadmap ? (
        <>
          {/* ── Header row ── */}
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.15em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
                Current Roadmap
              </div>
              <h2 className="font-['Playfair_Display',serif] text-[22px] font-extrabold leading-tight tracking-[-0.4px] text-[#1a1714] dark:text-[#f2f0eb]">
                {currentRoadmap.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {/* Level badge */}
                <span
                  className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.08em]"
                  style={{
                    color: levelCfg.color,
                    background: levelCfg.bg,
                    borderColor: levelCfg.color + '33',
                  }}
                >
                  {levelCfg.emoji} {currentRoadmap.level}
                </span>
                <span className="text-[12px] text-[#6b5f58] dark:text-[#9b9a92]">
                  Last studied {formatRelativeTime(currentRoadmap.lastStudiedAt)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate(`/trackers/${currentRoadmap._id}/roadmap`)}
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#b84c2b] px-5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#963d22] hover:shadow-[0_8px_24px_rgba(184,76,43,0.28)] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
            >
              Continue →
            </button>
          </div>

          {/* ── Divider ── */}
          <div className="my-5 border-t border-[rgba(26,23,20,0.07)] dark:border-white/7" />

          {/* ── Progress section ── */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                Completion Progress
              </span>
              <span className="font-['DM_Mono',monospace] text-[13px] font-bold tracking-[0.04em] text-[#b84c2b] dark:text-[#e8816a]">
                {Math.round(progress)}%
              </span>
            </div>

            {/* Bar + milestone dots */}
            <div className="relative">
              <div className="h-2.5 overflow-hidden rounded-full bg-[rgba(26,23,20,0.08)] dark:bg-white/8">
                <div
                  className="h-full rounded-full bg-linear-to-r from-[#e8816a] to-[#b84c2b] transition-all duration-700 dark:from-[#f5a090] dark:to-[#e8816a]"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              {/* Milestone ticks */}
              <div className="pointer-events-none absolute inset-0 flex items-center">
                {milestones.map((m) => (
                  <div
                    key={m.value}
                    className="absolute flex flex-col items-center"
                    style={{ left: `${m.value}%`, transform: 'translateX(-50%)' }}
                  >
                    <div
                      className={`h-2.5 w-0.5 rounded-full transition-colors duration-500 ${
                        m.reached
                          ? 'bg-white/60'
                          : 'bg-[rgba(26,23,20,0.15)] dark:bg-white/15'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Milestone labels */}
            <div className="relative mt-1 h-4">
              {milestones.map((m) => (
                <span
                  key={m.value}
                  className={`absolute font-['DM_Mono',monospace] text-[9px] transition-colors duration-500 ${
                    m.reached
                      ? 'text-[#b84c2b] dark:text-[#e8816a]'
                      : 'text-[#6b5f58]/40 dark:text-[#9b9a92]/40'
                  }`}
                  style={{ left: `${m.value}%`, transform: 'translateX(-50%)' }}
                >
                  {m.value}%
                </span>
              ))}
            </div>
          </div>

          {/* ── Mini stat pills ── */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
  { label: 'Topics',    value: currentRoadmap.totalTopics,     sub: 'total in roadmap' },
  { label: 'Done',      value: currentRoadmap.completedTopics, sub: 'topics completed' },
  { label: 'Remaining', value: currentRoadmap.remainingTopics, sub: 'left to study' },
].map(({ label, value, sub }) => (
              <div
                key={label}
                className="rounded-xl border border-[#e0d0c5] bg-[rgba(26,23,20,0.02)] px-3 py-2.5 dark:border-white/8 dark:bg-white/3"
              >
                <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#6b5f58]/60 dark:text-[#9b9a92]/60">
                  {label}
                </div>
                <div className="mt-0.5 font-['Playfair_Display',serif] text-[18px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                  {value}
                </div>
                <div className="text-[10px] text-[#6b5f58]/50 dark:text-[#9b9a92]/50">
                  {sub}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mb-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.15em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
            Current Roadmap
          </div>
          <h2 className="font-['Playfair_Display',serif] text-[22px] font-extrabold tracking-[-0.4px] text-[#1a1714] dark:text-[#f2f0eb]">
            No active roadmap
          </h2>
          <p className="mt-1 text-[12.5px] text-[#6b5f58] dark:text-[#9b9a92]">
            Create a tracker to start your personalized learning path.
          </p>
          <div className="mt-4">
            <EmptyCard
              title="Your dashboard is ready"
              description="Generate your first roadmap to unlock active progress, study heatmaps, and recommendations."
            />
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/onboarding/step-1')}
            className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-[#b84c2b] px-5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#963d22] dark:bg-[#e8816a] dark:text-[#141412]"
          >
            Create Tracker
          </button>
        </>
      )}
    </div>
  )
}