import ImminiqLogo from './ImminiqLogo';

export default function AuthLoadingScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-(--surface-canvas) px-6 font-[DM_Sans,sans-serif] text-(--text-primary) dark:bg-(--surface-canvas) dark:text-(--text-primary)">
      {/* ambient background */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-105 w-105 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.14)_0%,rgba(184,76,43,0.04)_38%,transparent_72%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(232,129,106,0.16)_0%,rgba(232,129,106,0.05)_38%,transparent_72%)]" />

      <div className="relative flex w-full max-w-105 flex-col items-center text-center">
        {/* loader emblem */}
        <div className="relative mb-8 flex h-36 w-36 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-(--brand-500)/70 border-r-(--brand-500)/25 dark:border-t-(--brand-500)/80 dark:border-r-(--brand-500)/25" />

          <div className="absolute inset-3 animate-[spin_2.8s_linear_infinite_reverse] rounded-full border border-transparent border-b-(--brand-500)/50 border-l-(--brand-500)/20 dark:border-b-(--brand-500)/60 dark:border-l-(--brand-500)/20" />

          <div className="absolute inset-7 animate-pulse rounded-full border border-[rgba(184,76,43,0.15)] bg-[rgba(253,248,245,0.82)] shadow-[0_18px_60px_rgba(184,76,43,0.14)] backdrop-blur-md dark:border-(--border-subtle) dark:bg-[rgba(30,28,25,0.78)] dark:shadow-[0_18px_70px_rgba(232,129,106,0.11)]" />

          <div className="relative animate-[loaderFloat_2.4s_ease-in-out_infinite]">
            <ImminiqLogo size={64} className="rounded-lg" decorative />
          </div>
        </div>

        {/* brand title */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-(--brand-500)">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--brand-500) dark:bg-(--brand-500)" />
          Session sync
        </div>

        <h1 className="mb-2 font-serif text-[clamp(24px,5vw,34px)] font-extrabold tracking-[-0.8px]">
          Restoring your learning space
        </h1>

        <p className="max-w-85 text-sm leading-[1.65] text-(--text-secondary) dark:text-(--text-secondary)">
          Reconnecting your session and preparing your Imminiq workspace.
        </p>

        {/* animated progress line */}
        <div className="mt-7 h-1.5 w-full max-w-67.5 overflow-hidden rounded-full bg-[rgba(184,76,43,0.12)] dark:bg-[rgba(232,129,106,0.14)]">
          <div className="h-full w-1/2 animate-[loadingSweep_1.5s_ease-in-out_infinite] rounded-full bg-(--brand-500) dark:bg-(--brand-500)" />
        </div>
      </div>

      <style>{`
        @keyframes loaderFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-5px) scale(1.02);
          }
        }

        @keyframes loadingSweep {
          0% {
            transform: translateX(-120%);
          }
          50% {
            transform: translateX(70%);
          }
          100% {
            transform: translateX(220%);
          }
        }
      `}</style>
    </div>
  );
}
