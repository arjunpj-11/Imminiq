export default function LessonNavigationPreview({
  previousLesson,
  nextLesson,
  onOpenLesson,
  onComplete,
  completing,
  isCompleted,
}: {
  previousLesson: { _id: string; title: string } | null
  nextLesson: { _id: string; title: string } | null
  onOpenLesson: (id: string) => void
  onComplete: () => void
  completing: boolean
  isCompleted: boolean
}) {
  return (
    <section className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">Lesson Navigation</h3>
          <p className="mt-1 text-[11.5px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
            Jump to the previous or next lesson quickly.
          </p>
        </div>
        <span className="rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.08em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
          Quick Jump
        </span>
      </div>

      <div className="space-y-3">
        {/* ── Mark as Complete / Completed badge ── */}
        {isCompleted ? (
          <div className="flex items-center gap-2 rounded-[14px] border-[1.5px] border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-4 py-3 dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4caf7d] text-[11px] text-white">
              ✓
            </span>
            <span className="text-[13px] font-bold text-[#2d6a47] dark:text-[#5cc98a]">
              Lesson Completed
            </span>
          </div>
        ) : (
          <button
            type="button"
            disabled={completing}
            onClick={onComplete}
            className="w-full rounded-[14px] bg-[#b84c2b] px-4 py-3.5 text-[13px] font-bold text-[#fdf8f5] shadow-[0_4px_12px_rgba(184,76,43,0.28)] transition hover:-translate-y-px hover:bg-[#963d22] disabled:cursor-wait disabled:opacity-60 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
          >
            {completing ? 'Saving...' : '✓ Mark as Complete'}
          </button>
        )}

        {/* ── Previous lesson ── */}
        {previousLesson ? (
          <button
            type="button"
            onClick={() => onOpenLesson(previousLesson._id)}
            className="group w-full rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.05)] dark:border-white/9 dark:bg-[#252320] dark:hover:border-[rgba(232,129,106,0.25)] dark:hover:bg-[rgba(232,129,106,0.08)]"
          >
            <div className="mb-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-60 dark:text-[#9b9a92]">
              Previous
            </div>
            <div className="flex items-center justify-between gap-3">
              <h4 className="line-clamp-2 text-[13px] font-bold leading-[1.35] text-[#1a1714] dark:text-[#f2f0eb]">
                {previousLesson.title}
              </h4>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e0d0c5] text-[#6b5f58] transition group-hover:border-[#e8816a] group-hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:group-hover:text-[#e8816a]">
                ←
              </span>
            </div>
          </button>
        ) : (
          <div className="rounded-[14px] border-[1.5px] border-dashed border-[#e0d0c5] p-4 text-[12px] text-[#6b5f58] dark:border-white/9 dark:text-[#9b9a92]">
            This is the first lesson.
          </div>
        )}

        {/* ── Next lesson ── */}
        {nextLesson && (
          <button
            type="button"
            onClick={() => onOpenLesson(nextLesson._id)}
            className="group w-full rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.05)] dark:border-white/9 dark:bg-[#252320] dark:hover:border-[rgba(232,129,106,0.25)] dark:hover:bg-[rgba(232,129,106,0.08)]"
          >
            <div className="mb-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#b84c2b] dark:text-[#e8816a]">
              Up Next
            </div>
            <div className="flex items-center justify-between gap-3">
              <h4 className="line-clamp-2 text-[13px] font-bold leading-[1.35] text-[#1a1714] dark:text-[#f2f0eb]">
                {nextLesson.title}
              </h4>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#b84c2b] text-white transition group-hover:translate-x-0.5 dark:bg-[#e8816a] dark:text-[#141412]">
                →
              </span>
            </div>
          </button>
        )}
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
