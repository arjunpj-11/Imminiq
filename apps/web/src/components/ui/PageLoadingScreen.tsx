interface PageLoadingScreenProps {
  eyebrow?: string;
  title?: string;
  description?: string;
}

export default function PageLoadingScreen({
  eyebrow = "Loading",
  title = "Preparing your page",
  description = "Please wait while Imminiq gets everything ready.",
}: PageLoadingScreenProps) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5ede4] px-4 font-['DM_Sans',sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]"
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
          backgroundSize: "180px 180px",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[10%] top-[14%] h-64 w-64 rounded-full bg-[rgba(184,76,43,0.10)] blur-3xl dark:bg-[rgba(232,129,106,0.08)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[14%] right-[10%] h-56 w-56 rounded-full bg-[rgba(59,108,183,0.10)] blur-3xl dark:bg-[rgba(107,159,232,0.08)]"
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-3xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-8 py-8 text-center shadow-[0_14px_48px_rgba(26,23,20,0.12)] dark:border-white/9 dark:bg-[#1e1c19] dark:shadow-[0_18px_60px_rgba(0,0,0,0.42)]">
        <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(184,76,43,0.20)] bg-[rgba(184,76,43,0.08)] dark:border-[rgba(232,129,106,0.24)] dark:bg-[rgba(232,129,106,0.10)]">
          <span className="absolute h-16 w-16 animate-ping rounded-full border border-[rgba(184,76,43,0.18)] dark:border-[rgba(232,129,106,0.22)]" />
          <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-[rgba(184,76,43,0.18)] border-t-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:border-t-[#e8816a]" />
        </div>

        <div className="mb-2 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.18em] text-[#b84c2b] dark:text-[#e8816a]">
          {eyebrow}
        </div>

        <h1 className="font-['Playfair_Display',serif] text-[22px] font-extrabold tracking-[-0.4px] text-[#1a1714] dark:text-[#f2f0eb]">
          {title}
        </h1>

        <p className="mt-2 max-w-72 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
          {description}
        </p>
      </div>
    </div>
  );
}
