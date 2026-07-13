import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { LEADERBOARD_ROUTES } from '../constants/leaderboard.constants'
import type {
  ILeaderboardEntry,
  ILeaderboardReward,
  ILeaderboardScoringRule,
  ILeaderboardWeeklySummary,
} from '../types/leaderboard.types'

import LeaderboardAvatar from './LeaderboardAvatar'
import {
  ChevronRightIcon,
  FireIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon,
} from './icons/LeaderboardIcons'

const SidebarCard = ({ children }: { children: ReactNode }) => (
  <div className="rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 dark:border-(--border-subtle) dark:bg-(--surface-card)">
    {children}
  </div>
)

const SidebarCardHeader = ({
  icon,
  title,
}: {
  icon: ReactNode
  title: string
}) => (
  <div className="mb-4 flex items-center gap-2">
    {icon}
    <span className="font-ui text-[14.5px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">{title}</span>
  </div>
)

interface ILeaderboardSidebarProps {
  weekly: ILeaderboardWeeklySummary
  scoringRules: ILeaderboardScoringRule[]
  streakChampions: ILeaderboardEntry[]
  reward: ILeaderboardReward
}

export default function LeaderboardSidebar({
  scoringRules,
  streakChampions,
  reward,
}: ILeaderboardSidebarProps) {
  const navigate = useNavigate()
 

  return (
    <aside className="flex w-65 shrink-0 flex-col gap-3 max-[860px]:w-full">
     
      <SidebarCard>
        <SidebarCardHeader icon={<SparklesIcon size={14} className="text-(--brand-500) dark:text-(--brand-500)" />} title="Scoring" />
        {scoringRules.map((rule) => (
          <div key={rule.source} className="flex items-center justify-between gap-4 border-b border-[#ece3db] py-2 last:border-b-0 dark:border-white/[0.07]">
            <span className="text-[12px] text-(--text-secondary) dark:text-(--text-secondary)">{rule.label}</span>
            <span className="shrink-0 font-mono text-[11px] font-bold text-(--brand-500) tabular-nums dark:text-(--brand-500)">{rule.xpLabel}</span>
          </div>
        ))}
      </SidebarCard>

      <SidebarCard>
        <SidebarCardHeader icon={<TrophyIcon size={14} className="text-[#c49a2c]" />} title="Streak champions" />
        {streakChampions.length > 0 ? (
          streakChampions.map((entry) => (
            <div key={entry.userId} className="flex items-center gap-2.5 border-b border-[#ece3db] py-2.25 last:border-b-0 dark:border-white/[0.07]">
              <LeaderboardAvatar initials={entry.initials} color={entry.avatarColor} avatarUrl={entry.avatarUrl} name={entry.name} size="sm" />
              <span className="flex-1 truncate text-[12.5px] text-(--text-primary) dark:text-(--text-primary)">{entry.name}</span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-[#b0a097] tabular-nums dark:text-[#6b6460]"><FireIcon size={11} /> {entry.streak}</span>
            </div>
          ))
        ) : (
          <p className="text-[12px] leading-relaxed text-[#9b8a82] dark:text-[#6b6460]">No streak champions are available yet.</p>
        )}
      </SidebarCard>

      <div className="rounded-2xl bg-(--brand-500) p-5 dark:bg-[#c65f43]">
        <div className="mb-2.5 flex items-center gap-2">
          <StarIcon size={13} className="text-[rgba(255,255,255,0.75)]" />
          <span className="font-ui text-[14.5px] font-extrabold text-white">{reward.title}</span>
        </div>
        <p className="mb-4 text-[11.5px] leading-[1.6] text-[rgba(255,255,255,0.8)]">{reward.description}</p>
        <button
          type="button"
          onClick={() => navigate(LEADERBOARD_ROUTES.rewards)}
          className="flex w-full items-center justify-center gap-1.5 rounded-sm border border-white/20 bg-white/12 py-2.5 text-[12px] font-bold text-white transition-colors hover:bg-white/22 active:scale-[0.98]"
        >
          View rewards <ChevronRightIcon />
        </button>
      </div>
    </aside>
  )
}
