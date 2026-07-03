type DailyInsightCardProps = {
  insight?: string | null
  onDismiss: () => void
}

export default function DailyInsightCard({
  insight,
  onDismiss,
}: DailyInsightCardProps) {
  return (
    <section className="relative flex flex-wrap items-center gap-4 overflow-hidden rounded-2xl bg-linear-to-br from-(--brand-500) to-[#963d22] px-5.5 py-4 shadow-[0_8px_32px_rgba(184,76,43,0.28)]">
      <div className="relative z-1 text-[26px]">💡</div>

      <div className="relative z-1 min-w-0 flex-1">
        <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.18em] text-white/65">
          AI Daily Insight
        </div>

        <div className="text-[13.5px] font-semibold leading-normal text-white">
          {insight ??
            'Keep your streak alive by completing at least one learning step today.'}
        </div>
      </div>

      <button
        type="button"
        aria-label="Dismiss insight"
        onClick={onDismiss}
        className="relative z-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-white/25 text-white/75 transition hover:bg-white/15 hover:text-white"
      >
        ×
      </button>
    </section>
  )
}
