import { useSearchParams } from 'react-router-dom';

import LeaderboardAppShell from '../components/LeaderboardAppShell';
import LeaderboardControls from '../components/LeaderboardControls';
import LeaderboardHeader from '../components/LeaderboardHeader';
import LeaderboardSectionView from '../components/LeaderboardSectionView';
import { LeaderboardContentSkeleton, LeaderboardErrorState } from '../components/LeaderboardStates';
import { LEADERBOARD_DISPLAY_LIMIT } from '../constants/leaderboard.constants';
import { useLeaderboard } from '../hooks/useLeaderboard';
import type { LeaderboardScope, LeaderboardSection } from '../types/leaderboard.types';
import { parseLeaderboardScope, parseLeaderboardSection } from '../utils/leaderboard-formatters';
import PageContainer from '../../../../components/layout/PageContainer';

export default function LeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const section = parseLeaderboardSection(searchParams.get('section'));
  const scope = parseLeaderboardScope(searchParams.get('scope'));

  const leaderboardQuery = useLeaderboard({
    section,
    scope,
    limit: LEADERBOARD_DISPLAY_LIMIT,
  });

  const updateFilters = (nextSection: LeaderboardSection, nextScope: LeaderboardScope) => {
    setSearchParams(
      {
        section: nextSection,
        scope: nextScope,
      },
      { replace: true }
    );
  };

  const currentUser = leaderboardQuery.data?.currentUser;
  const viewer = currentUser
    ? {
        name: currentUser.name,
        initials: currentUser.initials,
        avatarUrl: currentUser.avatarUrl,
        streak: currentUser.streak,
        levelLabel: currentUser.track,
      }
    : undefined;

  return (
    <LeaderboardAppShell viewer={viewer}>
      <PageContainer className="gap-7">
        {leaderboardQuery.isPending ? (
          <LeaderboardContentSkeleton />
        ) : leaderboardQuery.isError || !leaderboardQuery.data ? (
          <LeaderboardErrorState
            message={leaderboardQuery.error?.response?.data?.message}
            onRetry={() => void leaderboardQuery.refetch()}
          />
        ) : (
          <>
            <LeaderboardHeader
              globalRank={leaderboardQuery.data.summary.globalRank}
              globalRankTrend={leaderboardQuery.data.summary.globalRankTrend}
            />

            <LeaderboardControls
              activeSection={section}
              activeScope={scope}
              counts={leaderboardQuery.data.counts}
              onSectionChange={(nextSection) => updateFilters(nextSection, scope)}
              onScopeChange={(nextScope) => updateFilters(section, nextScope)}
              disabled={leaderboardQuery.isFetching}
            />

            {leaderboardQuery.isFetching && (
              <div
                className="-mb-5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#b0a097] dark:text-[#6b6460]"
                role="status"
                aria-live="polite"
              >
                Updating leaderboard…
              </div>
            )}

            <LeaderboardSectionView leaderboard={leaderboardQuery.data} />
          </>
        )}
      </PageContainer>
    </LeaderboardAppShell>
  );
}
