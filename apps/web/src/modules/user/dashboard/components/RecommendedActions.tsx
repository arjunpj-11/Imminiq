import type { IDashboardRecommendedAction } from '../types/dashboard.types';
import { cn } from '../utils/cn';

type RecommendedActionsProps = {
  actions: IDashboardRecommendedAction[];
  onNavigate: (link: string) => void;
};

export default function RecommendedActions({ actions, onNavigate }: RecommendedActionsProps) {
  if (actions.length === 0) return null;

  return (
    <section aria-labelledby="recommended-next-step">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-(--brand-500)">
            Recommended next
          </div>
          <h2
            id="recommended-next-step"
            className="mt-1 text-[18px] font-extrabold text-(--text-primary)"
          >
            Keep your momentum
          </h2>
        </div>
        <span className="hidden text-[12px] text-(--text-muted) sm:block">
          Based on your recent learning
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {actions.map((action, index) => (
          <button
            key={`${action.type}-${action.link}`}
            type="button"
            onClick={() => onNavigate(action.link)}
            className={cn(
              'group min-h-24 rounded-xl border-[1.5px] px-4 py-3.5 text-left shadow-(--shadow-1) transition hover:-translate-y-px',
              index === 0
                ? 'border-(--brand-500) bg-(--brand-500) text-[#fdf8f5] hover:bg-(--brand-600) dark:border-(--brand-500) dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)'
                : 'border-(--border-subtle) bg-(--surface-card) text-(--text-secondary) hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary) dark:hover:text-(--brand-500)'
            )}
          >
            <span className="flex items-center justify-between gap-3 text-[13px] font-extrabold">
              {action.title}
              <span aria-hidden="true" className="transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
            <span
              className={cn(
                'mt-1.5 block text-[12px] font-normal leading-5',
                index === 0 ? 'text-current opacity-80' : 'text-(--text-muted)'
              )}
            >
              {action.description}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
