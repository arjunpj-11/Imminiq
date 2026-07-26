import { Link } from 'react-router';

import { formatRank, formatRankTrendHint } from '../utils/leaderboard-formatters';
import { LiveDotIcon } from './icons/LeaderboardIcons';
import PageHero from '../../../../components/layout/PageHero';
import { ROUTES } from '../../../../routes/config/route-paths';

interface ILeaderboardHeaderProps {
  globalRank: number | null;
  globalRankTrend: number;
}

export default function LeaderboardHeader({
  globalRank,
  globalRankTrend,
}: ILeaderboardHeaderProps) {
  return (
    <PageHero
      eyebrow="Live competition"
      title={
        <>
          Arena <span className="text-(--brand-500) dark:text-(--brand-500)">Leaderboard</span>
        </>
      }
      description="See where consistent practice is paying off, compare progress across the community, and find your next milestone."
      aside={
        <div>
          <div className="flex items-center justify-between gap-3">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
              Global rank
            </div>
            <span className="text-(--brand-500)">
              <LiveDotIcon />
            </span>
          </div>
          <div className="mt-3 font-ui text-[36px] font-black leading-none tracking-[-1.5px] text-(--text-primary)">
            {formatRank(globalRank)}
          </div>
          <p className="mt-3 text-[12px] leading-5 text-(--text-secondary)">
            {globalRank === null
              ? 'Earn XP to enter the leaderboard'
              : formatRankTrendHint(globalRankTrend)}
          </p>
          <Link
            to={ROUTES.leaderboardRewards}
            className="mt-3 inline-flex min-h-9 items-center text-[12px] font-bold text-(--brand-500) no-underline hover:underline"
          >
            How ranking and rewards work →
          </Link>
        </div>
      }
    />
  );
}
