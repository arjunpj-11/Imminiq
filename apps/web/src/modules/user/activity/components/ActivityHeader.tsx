import { FireIcon } from './icons/ActivityIcons';
import PageHero from '../../../../components/layout/PageHero';

interface IActivityHeaderProps {
  currentStreak: number;
}

export default function ActivityHeader({ currentStreak }: IActivityHeaderProps) {
  return (
    <PageHero
      eyebrow="Personal intelligence"
      title={
        <>
          Your <span className="text-(--brand-500) dark:text-(--brand-500)">Activity</span>
        </>
      }
      description="Understand when you learn best, where your effort goes, and how daily practice compounds into mastery."
      aside={
        <div className="flex items-center justify-between gap-5">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
              Current streak
            </div>
            <span className="mt-2 block font-ui text-[38px] font-black leading-none text-(--brand-500) tabular-nums">
              {Math.max(0, currentStreak)} days
            </span>
            <div className="mt-2 text-[11px] font-semibold text-(--text-secondary)">
              {currentStreak > 0 ? 'Keep the momentum going.' : 'Start a new streak today.'}
            </div>
          </div>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[rgba(184,76,43,0.09)] text-(--brand-500)">
            <FireIcon size={24} />
          </span>
        </div>
      }
    />
  );
}
