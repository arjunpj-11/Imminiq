import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import LeaderboardAppShell from '../components/LeaderboardAppShell'
import LeaderboardRewardsView from '../components/LeaderboardRewardsView'
import {
  LeaderboardContentSkeleton,
  LeaderboardErrorState,
} from '../components/LeaderboardStates'
import {
  LEADERBOARD_ROUTES,
  LEADERBOARD_SECTION_LABELS,
  LEADERBOARD_SECTIONS,
} from '../constants/leaderboard.constants'
import { useLeaderboardRewards } from '../hooks/useLeaderboardRewards'
import type { LeaderboardSection } from '../types/leaderboard.types'
import { cn } from '../utils/leaderboard-ui'
import {
  ArrowLeftIcon,
  ChalkBoardIcon,
  GraduationCapIcon,
} from '../components/icons/LeaderboardIcons'

export default function LeaderboardRewardsPage() {
  const navigate = useNavigate()
  const [section, setSection] = useState<LeaderboardSection>('students')
  const rewardsQuery = useLeaderboardRewards()

  return (
    <LeaderboardAppShell>
      <div className="mx-auto mt-6 flex w-[min(1080px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-7 pb-[calc(80px+env(safe-area-inset-bottom,0)+24px)] max-[900px]:w-[calc(100%-32px)] max-[640px]:w-[calc(100%-20px)]">
        {rewardsQuery.isPending ? (
          <LeaderboardContentSkeleton />
        ) : rewardsQuery.isError || !rewardsQuery.data ? (
          <LeaderboardErrorState
            message={rewardsQuery.error?.response?.data?.message}
            onRetry={() => void rewardsQuery.refetch()}
          />
        ) : (
          <>
            <header>
              <button
                type="button"
                onClick={() => navigate(LEADERBOARD_ROUTES.leaderboard)}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e0d0c5] bg-[#fdf8f5] px-3.5 py-2 font-['DM_Mono',monospace] text-[10px] font-bold uppercase tracking-[0.07em] text-[#7a6e66] transition hover:border-[rgba(184,76,43,0.28)] hover:text-[#b84c2b] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
              >
                <ArrowLeftIcon /> Back to leaderboard
              </button>
              <h1 className="font-['Playfair_Display',serif] text-[clamp(30px,4vw,44px)] font-black leading-tight text-[#1a1714] dark:text-[#f2f0eb]">
                Rewards & <span className="text-[#b84c2b] dark:text-[#e8816a]">Scoring</span>
              </h1>
              <p className="mt-2 max-w-155 text-[13px] italic leading-[1.7] text-[#7a6e66] dark:text-[#9b9a92]">
                See how XP is earned and what you can unlock by reaching the weekly leaderboard target.
              </p>
            </header>

            <div className="flex gap-2.5 max-[420px]:flex-col" role="group" aria-label="Reward category">
              {LEADERBOARD_SECTIONS.map((option) => {
                const active = option === section
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSection(option)}
                    aria-pressed={active}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[12px] font-bold transition',
                      active
                        ? 'border-[#b84c2b] bg-[#b84c2b] text-white dark:border-[#e8816a] dark:bg-[#e8816a] dark:text-[#141412]'
                        : 'border-[#e0d0c5] bg-[#fdf8f5] text-[#7a6e66] hover:border-[rgba(184,76,43,0.28)] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92]',
                    )}
                  >
                    {option === 'students' ? <GraduationCapIcon size={18} /> : <ChalkBoardIcon size={18} />}
                    {LEADERBOARD_SECTION_LABELS[option].label}
                  </button>
                )
              })}
            </div>

            <LeaderboardRewardsView
              section={section}
              scoringRules={rewardsQuery.data[section].scoringRules}
              reward={rewardsQuery.data[section].reward}
            />
          </>
        )}
      </div>
    </LeaderboardAppShell>
  )
}
