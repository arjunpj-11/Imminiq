export default function LessonNavigationPreview({
  previousLesson,
  nextLesson,
  onOpenLesson,
  onComplete,
  completing,
  isCompleted,
}: {
  previousLesson: { _id: string; title: string } | null;
  nextLesson: { _id: string; title: string } | null;
  onOpenLesson: (id: string) => void;
  onComplete: () => void;
  completing: boolean;
  isCompleted: boolean;
}) {
  return (
    <section className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-bold text-(--text-primary) dark:text-(--text-primary)">
            Lesson Navigation
          </h3>
          <p className="mt-1 text-[11.5px] leading-normal text-(--text-secondary) dark:text-(--text-secondary)">
            Jump to the previous or next lesson quickly.
          </p>
        </div>
        <span className="rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
          Quick Jump
        </span>
      </div>

      <div className="space-y-3">
        {/* ── Mark as Complete / Completed badge ── */}
        {isCompleted ? (
          <div className="flex items-center gap-2 rounded-md border-[1.5px] border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-4 py-3 dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-(--success) text-[11px] text-white">
              ✓
            </span>
            <span className="text-[13px] font-bold text-(--success) dark:text-(--success)">
              Lesson Completed
            </span>
          </div>
        ) : (
          <button
            type="button"
            disabled={completing}
            onClick={onComplete}
            className="w-full rounded-md bg-(--brand-500) px-4 py-3.5 text-[13px] font-bold text-[#fdf8f5] shadow-[0_4px_12px_rgba(184,76,43,0.28)] transition hover:-translate-y-px hover:bg-(--brand-600) disabled:cursor-wait disabled:opacity-60 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
          >
            {completing ? 'Saving...' : '✓ Mark as Complete'}
          </button>
        )}

        {/* ── Previous lesson ── */}
        {previousLesson ? (
          <button
            type="button"
            onClick={() => onOpenLesson(previousLesson._id)}
            className="group w-full rounded-md border-[1.5px] border-(--border-subtle) bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.05)] dark:border-(--border-subtle) dark:bg-(--surface-elevated) dark:hover:border-[rgba(232,129,106,0.25)] dark:hover:bg-[rgba(232,129,106,0.08)]"
          >
            <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.14em] text-(--text-secondary) opacity-60 dark:text-(--text-secondary)">
              Previous
            </div>
            <div className="flex items-center justify-between gap-3">
              <h4 className="line-clamp-2 text-[13px] font-bold leading-[1.35] text-(--text-primary) dark:text-(--text-primary)">
                {previousLesson.title}
              </h4>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-(--border-subtle) text-(--text-secondary) transition group-hover:border-(--brand-500) group-hover:text-(--brand-500) dark:border-(--border-subtle) dark:text-(--text-secondary) dark:group-hover:text-(--brand-500)">
                ←
              </span>
            </div>
          </button>
        ) : (
          <div className="rounded-md border-[1.5px] border-dashed border-(--border-subtle) p-4 text-[12px] text-(--text-secondary) dark:border-(--border-subtle) dark:text-(--text-secondary)">
            This is the first lesson.
          </div>
        )}

        {/* ── Next lesson ── */}
        {nextLesson && (
          <button
            type="button"
            onClick={() => onOpenLesson(nextLesson._id)}
            className="group w-full rounded-md border-[1.5px] border-(--border-subtle) bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.05)] dark:border-(--border-subtle) dark:bg-(--surface-elevated) dark:hover:border-[rgba(232,129,106,0.25)] dark:hover:bg-[rgba(232,129,106,0.08)]"
          >
            <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.14em] text-(--brand-500) dark:text-(--brand-500)">
              Up Next
            </div>
            <div className="flex items-center justify-between gap-3">
              <h4 className="line-clamp-2 text-[13px] font-bold leading-[1.35] text-(--text-primary) dark:text-(--text-primary)">
                {nextLesson.title}
              </h4>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--brand-500) text-white transition group-hover:translate-x-0.5 dark:bg-(--brand-500) dark:text-[#141412]">
                →
              </span>
            </div>
          </button>
        )}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
