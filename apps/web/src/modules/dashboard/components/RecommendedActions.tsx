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
            'inline-flex items-center gap-2 rounded-[10px] border-[1.5px] px-4.5 py-2.5 text-[12.5px] font-semibold shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-px',
            index === 0
              ? 'border-[#b84c2b] bg-[#b84c2b] text-[#fdf8f5] hover:bg-[#963d22] dark:border-[#e8816a] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]'
              : 'border-[#e0d0c5] bg-[#fdf8f5] text-[#6b5f58] hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92] dark:hover:text-[#e8816a]'
          )}
        >
          {action.title}
        </button>
      ))}
    </div>
  )
}
