const LogoIcon = () => {
  return (
    <svg
      className="h-16 w-16 rounded-[18px]"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="10" y="10" width="80" height="80" rx="18" fill="#050505" />

      <g transform="translate(-5, 1)">
        <rect x="31" y="35" width="9" height="34" rx="4.5" fill="#fff8ed" />
        <circle cx="35.5" cy="28.5" r="5.3" fill="#f15a35" />

        <path
          d="M64 32.8 C73.8 34.7 79.5 42.2 79.5 51.5 C79.5 61.8 71.2 68 60.2 68 C53.2 68 48.2 65.5 45.1 60.8"
          fill="none"
          stroke="#fff8ed"
          strokeWidth="9"
          strokeLinecap="round"
        />

        <line
          x1="63.8"
          y1="55.5"
          x2="75.8"
          y2="67.5"
          stroke="#f15a35"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

export default function AuthLoadingScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5ede4] px-6 font-[DM_Sans,sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      {/* ambient background */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-105 w-105 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.14)_0%,rgba(184,76,43,0.04)_38%,transparent_72%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(232,129,106,0.16)_0%,rgba(232,129,106,0.05)_38%,transparent_72%)]" />

      <div className="relative flex w-full max-w-105 flex-col items-center text-center">
        {/* loader emblem */}
        <div className="relative mb-8 flex h-36 w-36 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-[#b84c2b]/70 border-r-[#b84c2b]/25 dark:border-t-[#e8816a]/80 dark:border-r-[#e8816a]/25" />

          <div className="absolute inset-3 animate-[spin_2.8s_linear_infinite_reverse] rounded-full border border-transparent border-b-[#b84c2b]/50 border-l-[#b84c2b]/20 dark:border-b-[#e8816a]/60 dark:border-l-[#e8816a]/20" />

          <div className="absolute inset-7 animate-pulse rounded-full border border-[rgba(184,76,43,0.15)] bg-[rgba(253,248,245,0.82)] shadow-[0_18px_60px_rgba(184,76,43,0.14)] backdrop-blur-md dark:border-white/10 dark:bg-[rgba(30,28,25,0.78)] dark:shadow-[0_18px_70px_rgba(232,129,106,0.11)]" />

          <div className="relative animate-[loaderFloat_2.4s_ease-in-out_infinite]">
            <LogoIcon />
          </div>
        </div>

        {/* brand title */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-[#e8816a]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />
          Session sync
        </div>

        <h1 className="mb-2 font-serif text-[clamp(24px,5vw,34px)] font-extrabold tracking-[-0.8px]">
          Restoring your learning space
        </h1>

        <p className="max-w-85 text-sm leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
          Reconnecting your session and preparing your Imminiq workspace.
        </p>

        {/* animated progress line */}
        <div className="mt-7 h-1.5 w-full max-w-67.5 overflow-hidden rounded-full bg-[rgba(184,76,43,0.12)] dark:bg-[rgba(232,129,106,0.14)]">
          <div className="h-full w-1/2 animate-[loadingSweep_1.5s_ease-in-out_infinite] rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />
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
  )
}