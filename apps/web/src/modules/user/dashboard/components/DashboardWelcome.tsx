type DashboardWelcomeProps = {
  summary: {
    user: { fullName: string };
    streak: { current: number };
  };
};

export default function DashboardWelcome({ summary }: DashboardWelcomeProps) {
  return (
    <PageHero
      eyebrow="Dashboard overview"
      title={
        <>
          Welcome back,{' '}
          <span className="text-(--brand-500)">{summary.user.fullName.split(' ')[0]}</span>
        </>
      }
      description="Every focused session compounds. Continue your roadmap, protect your streak, and turn today’s work into measurable progress."
      aside={
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.09)] text-[22px]">
            🔥
          </div>
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
              Current streak
            </div>
            <div className="mt-1 font-ui text-[30px] font-extrabold leading-none tracking-[-1.5px] text-(--text-primary)">
              {summary.streak.current} days
            </div>
            <div className="mt-1.5 text-[11px] text-(--text-secondary)">
              Keep the learning loop alive.
            </div>
          </div>
        </div>
      }
    />
  );
}
import PageHero from '../../../../components/layout/PageHero';
