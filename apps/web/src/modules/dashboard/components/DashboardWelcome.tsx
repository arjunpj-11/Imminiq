type DashboardWelcomeProps = {
  summary: {
    user: { fullName: string }
    streak: { current: number }
  }
}

export default function DashboardWelcome({ summary }: DashboardWelcomeProps) {
  return (
    <section className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
          <span className="h-1.25 w-1.25 rounded-full bg-[#4caf7d] dark:bg-[#5cc98a]" />
          Dashboard Overview
        </div>

        <h1 className="font-['Playfair_Display',serif] text-[clamp(26px,3.5vw,38px)] font-extrabold leading-[1.15] tracking-[-0.8px] text-[#1a1714] dark:text-[#f2f0eb]">
          Welcome back,{' '}
          <span className="text-[#b84c2b] dark:text-[#e8816a]">
            {summary.user.fullName.split(' ')[0]}
          </span>
        </h1>

        <p className="mt-2 max-w-115 text-[13px] italic leading-[1.55] text-[#6b5f58] opacity-80 dark:text-[#9b9a92]">
          Every focused session compounds. Keep your roadmap moving forward today.
        </p>
      </div>

      <div className="relative flex min-w-47.5 items-center gap-4 overflow-hidden rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-5 py-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border-[1.5px] border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[20px]">
          🔥
        </div>

        <div>
          <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
            Current Streak
          </div>
          <div className="font-['Playfair_Display',serif] text-[28px] font-extrabold leading-none tracking-[-1.5px] text-[#1a1714] dark:text-[#f2f0eb]">
            {summary.streak.current}d
          </div>
        </div>
      </div>
    </section>
  )
}
