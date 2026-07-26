import { useState } from 'react';
import { useNavigate } from 'react-router';

import LeaderboardAppShell from '../components/LeaderboardAppShell';
import LeaderboardRewardsView from '../components/LeaderboardRewardsView';
import { LeaderboardContentSkeleton, LeaderboardErrorState } from '../components/LeaderboardStates';
import {
  LEADERBOARD_ROUTES,
  LEADERBOARD_SECTION_LABELS,
  LEADERBOARD_SECTIONS,
} from '../constants/leaderboard.constants';
import { useLeaderboardRewards } from '../hooks/useLeaderboardRewards';
import type { LeaderboardSection } from '../types/leaderboard.types';
import { cn } from '../utils/leaderboard-ui';
import {
  ArrowLeftIcon,
  ChalkBoardIcon,
  GraduationCapIcon,
} from '../components/icons/LeaderboardIcons';
import PageContainer from '../../../../components/layout/PageContainer';
import PageHero from '../../../../components/layout/PageHero';

export default function LeaderboardRewardsPage() {
  const navigate = useNavigate();
  const [section, setSection] = useState<LeaderboardSection>('students');
  const rewardsQuery = useLeaderboardRewards();

  return (
    <LeaderboardAppShell>
      <PageContainer className="max-w-270 gap-7">
        {rewardsQuery.isPending ? (
          <LeaderboardContentSkeleton />
        ) : rewardsQuery.isError || !rewardsQuery.data ? (
          <LeaderboardErrorState
            message={rewardsQuery.error?.response?.data?.message}
            onRetry={() => void rewardsQuery.refetch()}
          />
        ) : (
          <>
            <PageHero
              eyebrow="Arena guide"
              title={
                <>
                  Rewards & <span className="text-(--brand-500)">Scoring</span>
                </>
              }
              description="Understand how focused work becomes XP and what you can unlock by reaching the weekly leaderboard target."
              compact
              actions={
                <button
                  type="button"
                  onClick={() => navigate(LEADERBOARD_ROUTES.leaderboard)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-(--border-subtle) bg-(--surface-elevated) px-4 font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-(--text-secondary) transition hover:border-[rgba(184,76,43,0.28)] hover:text-(--brand-500)"
                >
                  <ArrowLeftIcon /> Back to leaderboard
                </button>
              }
            />

            <div
              className="flex gap-2.5 max-[420px]:flex-col"
              role="group"
              aria-label="Reward category"
            >
              {LEADERBOARD_SECTIONS.map((option) => {
                const active = option === section;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSection(option)}
                    aria-pressed={active}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[12px] font-bold transition',
                      active
                        ? 'border-(--brand-500) bg-(--brand-500) text-white dark:border-(--brand-500) dark:bg-(--brand-500) dark:text-[#141412]'
                        : 'border-(--border-subtle) bg-(--surface-card) text-[#7a6e66] hover:border-[rgba(184,76,43,0.28)] dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary)'
                    )}
                  >
                    {option === 'students' ? (
                      <GraduationCapIcon size={18} />
                    ) : (
                      <ChalkBoardIcon size={18} />
                    )}
                    {LEADERBOARD_SECTION_LABELS[option].label}
                  </button>
                );
              })}
            </div>

            <LeaderboardRewardsView
              section={section}
              scoringRules={rewardsQuery.data[section].scoringRules}
              reward={rewardsQuery.data[section].reward}
            />
          </>
        )}
      </PageContainer>
    </LeaderboardAppShell>
  );
}
