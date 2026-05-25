import EmptyCard from './EmptyCard'
import { formatRelativeTime } from '../utils/dashboard-formatters'

type CurrentRoadmap = {
  _id: string
  title: string
  level: string
  lastStudiedAt?: string | Date | null
  completionPercentage?: number | null
}

type CurrentRoadmapCardProps = {
  currentRoadmap?: CurrentRoadmap | null
  summary: {
    stats: {
      totalSubtopicsCompleted: number
      publishedTrackers: number
    }
  }
  onNavigate: (link: string) => void
}

export default function CurrentRoadmapCard({
  currentRoadmap,
  summary,
  onNavigate,
}: CurrentRoadmapCardProps) {
  const progress = currentRoadmap?.completionPercentage ?? 0

  return (
    <div className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19] max-[640px]:p-4.5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.15em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
            Current Roadmap
          </div>

          <h2 className="font-['Playfair_Display',serif] text-[22px] font-extrabold tracking-[-0.4px] text-[#1a1714] dark:text-[#f2f0eb]">
            {currentRoadmap?.title ?? 'No active roadmap'}
          </h2>

          <p className="mt-1 text-[12.5px] text-[#6b5f58] dark:text-[#9b9a92]">
            {currentRoadmap
              ? `${currentRoadmap.level} level · last studied ${formatRelativeTime(
                  currentRoadmap.lastStudiedAt
                )}`
              : 'Create a tracker to start your personalized learning path.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            onNavigate(
              currentRoadmap
                ? `/trackers/${currentRoadmap._id}/roadmap`
                : '/onboarding/step-1'
            )
          }
          className="inline-flex items-center gap-2 rounded-[10px] bg-[#b84c2b] px-5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#963d22] hover:shadow-[0_8px_24px_rgba(184,76,43,0.28)] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
        >
          {currentRoadmap ? 'Continue' : 'Create Tracker'}
        </button>
      </div>

      {currentRoadmap ? (
        <>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
              Completion Progress
            </span>
            <span className="font-['DM_Mono',monospace] text-[11px] tracking-[0.04em] text-[#b84c2b] dark:text-[#e8816a]">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="h-1.75 overflow-hidden rounded-full bg-[rgba(26,23,20,0.09)] dark:bg-white/9">
            <div
              className="h-full rounded-full bg-linear-to-r from-[#e8816a] to-[#b84c2b] transition-all duration-700 dark:from-[#f5a090] dark:to-[#e8816a]"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-[#e0d0c5] px-3.5 py-1.75 text-[12px] font-medium text-[#6b5f58] dark:border-white/9 dark:text-[#9b9a92]">
              {summary.stats.totalSubtopicsCompleted} subtopics completed
            </span>

            <span className="rounded-full border border-[#e0d0c5] px-3.5 py-1.75 text-[12px] font-medium text-[#6b5f58] dark:border-white/9 dark:text-[#9b9a92]">
              {summary.stats.publishedTrackers} published
            </span>
          </div>
        </>
      ) : (
        <EmptyCard
          title="Your dashboard is ready"
          description="Generate your first roadmap to unlock active progress, study heatmaps, and recommendations."
        />
      )}
    </div>
  )
}
