import type { DashboardRecommendedAction } from '../types/dashboard.types'
import { cn } from '../utils/cn'

type RecommendedActionsProps = {
  actions: DashboardRecommendedAction[]
  onNavigate: (link: string) => void
}

export default function RecommendedActions({
  actions,
  onNavigate,
}: RecommendedActionsProps) {
  if (actions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2.5">
      {actions.map((action, index) => (
        <button
          key={`${action.type}-${action.link}`}
          type="button"
          onClick={() => onNavigate(action.link)}
          className={cn(
            'inline-flex items-center gap-2 rounded-md border-[1.5px] px-4.5 py-2.5 text-[12.5px] font-semibold shadow-(--shadow-1) transition hover:-translate-y-px',
            index === 0
              ? 'border-(--brand-500) bg-(--brand-500) text-[#fdf8f5] hover:bg-(--brand-600) dark:border-(--brand-500) dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)'
              : 'border-(--border-subtle) bg-(--surface-card) text-(--text-secondary) hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary) dark:hover:text-(--brand-500)'
          )}
        >
          {action.title}
        </button>
      ))}
    </div>
  )
}
