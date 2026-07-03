import { cn } from '../utils/profile-ui.utils'

/* ─── Tracker Card ─── */
interface TrackerCardProps {
  title: string;
  desc: string;
  rating: number;
  clones: string;
  thumbClass: string;
  onClone: () => void;
  onClick: () => void;
}

export default function TrackerCard({
  title,
  desc,
  rating,
  clones,
  thumbClass,
  onClone,
  onClick,
}: TrackerCardProps) {
  return (
    <div
      className="bg-(--surface-card) dark:bg-(--surface-card) border-[1.5px] border-(--border-subtle) dark:border-(--border-subtle) rounded-2xl overflow-hidden shadow-(--shadow-1) cursor-pointer transition hover:border-[rgba(184,76,43,0.22)] hover:shadow-(--shadow-2) hover:-translate-y-0.75 duration-200"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
    >
      <div
        className={cn(
          "h-35 relative overflow-hidden flex items-center justify-center",
          thumbClass,
        )}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(255,255,255,0.04) 28px,rgba(255,255,255,0.04) 29px),repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(255,255,255,0.04) 28px,rgba(255,255,255,0.04) 29px)",
          }}
        />
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.25 py-1 rounded-full bg-[rgba(0,0,0,0.55)] backdrop-blur-sm font-mono text-[9px] text-white tracking-[0.06em]">
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="var(--warning)"
            stroke="none"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {rating.toFixed(1)}
        </div>
      </div>
      <div className="p-4">
        <div className="font-ui text-[16px] font-bold text-(--text-primary) dark:text-(--text-primary) tracking-[-0.3px] leading-tight mb-1.25">
          {title}
        </div>
        <p className="text-[12px] text-(--text-secondary) dark:text-(--text-secondary) leading-normal mb-3 min-h-9">
          {desc}
        </p>
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          <div className="text-[11.5px] text-(--text-secondary) dark:text-(--text-secondary) flex items-center gap-1">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            {clones} Clones
          </div>
          <button
            type="button"
            className="px-4 py-1.75 rounded-lg bg-[rgba(184,76,43,0.08)] dark:bg-[rgba(232,129,106,0.09)] border-[1.5px] border-[rgba(184,76,43,0.16)] dark:border-[rgba(232,129,106,0.22)] text-[12px] font-semibold text-(--brand-500) dark:text-(--brand-500) transition hover:bg-(--brand-500) hover:text-[#fdf8f5] hover:border-(--brand-500) hover:-translate-y-px"
            onClick={(e) => {
              e.stopPropagation();
              onClone();
            }}
          >
            Clone
          </button>
        </div>
      </div>
    </div>
  );
}
