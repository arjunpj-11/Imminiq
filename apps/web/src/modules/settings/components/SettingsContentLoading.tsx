interface SettingsContentLoadingProps {
  eyebrow?: string
  title?: string
  description?: string
}

export default function SettingsContentLoading({
  eyebrow = 'Loading',
  title = 'Preparing settings',
  description = 'Please wait while Imminiq gets everything ready.',
}: SettingsContentLoadingProps) {
  return (
    <div
      className="relative min-h-105 w-full overflow-hidden rounded-3xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-4 py-6 text-[#1a1714] shadow-[0_14px_48px_rgba(26,23,20,0.08)] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#f2f0eb] dark:shadow-[0_18px_60px_rgba(0,0,0,0.28)]"
      role="status"
      aria-live="polite"
      aria-label={title}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundSize: '180px 180px',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[10%] top-[12%] h-48 w-48 rounded-full bg-[rgba(184,76,43,0.10)] blur-3xl dark:bg-[rgba(232,129,106,0.08)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[10%] right-[10%] h-44 w-44 rounded-full bg-[rgba(59,108,183,0.10)] blur-3xl dark:bg-[rgba(107,159,232,0.08)]"
      />

      <div className="relative z-10 space-y-6">
        <div className="space-y-3">
          <div className="h-3 w-24 animate-pulse rounded-full bg-[#e8d8cf] dark:bg-white/10" />
          <div className="h-8 w-56 animate-pulse rounded-2xl bg-[#e8d8cf] dark:bg-white/10" />
          <div className="h-4 w-full max-w-xl animate-pulse rounded-full bg-[#efe2dc] dark:bg-white/8" />
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-[#efe2dc] dark:bg-white/8" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-3xl border-[1.5px] border-[#e0d0c5] bg-white/45 p-5 shadow-[0_10px_28px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-white/[0.035]"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="h-11 w-11 animate-pulse rounded-2xl bg-[#e8d8cf] dark:bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded-full bg-[#e8d8cf] dark:bg-white/10" />
                  <div className="h-3 w-44 animate-pulse rounded-full bg-[#efe2dc] dark:bg-white/8" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-11 w-full animate-pulse rounded-2xl bg-[#efe2dc] dark:bg-white/8" />
                <div className="h-11 w-full animate-pulse rounded-2xl bg-[#efe2dc] dark:bg-white/8" />
                <div className="h-11 w-2/3 animate-pulse rounded-2xl bg-[#efe2dc] dark:bg-white/8" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">
        {eyebrow}. {title}. {description}
      </span>
    </div>
  )
}