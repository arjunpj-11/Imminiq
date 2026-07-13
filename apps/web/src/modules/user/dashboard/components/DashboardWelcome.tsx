type DashboardWelcomeProps = {
  summary: {
    user: { fullName: string };
    streak: { current: number };
  };
};

export default function DashboardWelcome({ summary }: DashboardWelcomeProps) {
  return (
    <section className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-mono text-[8.5px] uppercase tracking-[0.12em] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
          <span className="h-1.25 w-1.25 rounded-full bg-(--success) dark:bg-(--success)" />
          Dashboard Overview
        </div>

        <h1 className="font-ui text-[clamp(26px,3.5vw,38px)] font-extrabold leading-[1.15] tracking-[-0.8px] text-(--text-primary) dark:text-(--text-primary)">
          Welcome back,{' '}
          <span className="text-(--brand-500) dark:text-(--brand-500)">
            {summary.user.fullName.split(' ')[0]}
          </span>
        </h1>

        <p className="mt-2 max-w-115 text-[13px] italic leading-[1.55] text-(--text-secondary) opacity-80 dark:text-(--text-secondary)">
          Every focused session compounds. Keep your roadmap moving forward today.
        </p>
      </div>

      <div className="relative flex min-w-47.5 items-center gap-4 overflow-hidden rounded-lg border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-5 py-4 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border-[1.5px] border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[20px]">
          🔥
        </div>

        <div>
          <div className="font-mono text-[7.5px] uppercase tracking-[0.14em] text-(--text-secondary) opacity-55 dark:text-(--text-secondary)">
            Current Streak
          </div>
          <div className="font-ui text-[28px] font-extrabold leading-none tracking-[-1.5px] text-(--text-primary) dark:text-(--text-primary)">
            {summary.streak.current}d
          </div>
        </div>
      </div>
    </section>
  );
}
