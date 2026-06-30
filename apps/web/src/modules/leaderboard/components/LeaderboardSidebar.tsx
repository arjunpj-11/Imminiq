import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { LEADERBOARD_ROUTES } from '../constants/leaderboard.constants'
import type {
  LeaderboardEntry,
  LeaderboardReward,
  LeaderboardScoringRule,
  LeaderboardWeeklySummary,
} from '../types/leaderboard.types'
import {
  formatGrowthLabel,
  formatNumber,
} from '../utils/leaderboard-formatters'
import LeaderboardAvatar from './LeaderboardAvatar'
import {
  ChevronRightIcon,
  FireIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon,
} from './icons/LeaderboardIcons'

const SidebarCard = ({ children }: { children: ReactNode }) => (
  <div className="rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]">
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
    <span className="font-['Playfair_Display',serif] text-[14.5px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">{title}</span>
  </div>
)

interface LeaderboardSidebarProps {
  weekly: LeaderboardWeeklySummary
  scoringRules: LeaderboardScoringRule[]
  streakChampions: LeaderboardEntry[]
  reward: LeaderboardReward
}

export default function LeaderboardSidebar({
  weekly,
  scoringRules,
  streakChampions,
  reward,
}: LeaderboardSidebarProps) {
  const navigate = useNavigate()
  const growthIsNegative = weekly.growthPercent < 0

  return (
    <aside className="flex w-[260px] shrink-0 flex-col gap-3 max-[860px]:w-full">
      <SidebarCard>
        <div className="mb-2 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#b0a097] dark:text-[#6b6460]">Weekly XP</div>
        <div className="mb-2.5 flex items-baseline gap-2">
          <span className="font-['Playfair_Display',serif] text-[26px] font-black leading-none text-[#1a1714] tabular-nums dark:text-[#f2f0eb]">{formatNumber(weekly.currentXp)}</span>
          <span className={growthIsNegative ? 'text-[11px] font-bold text-[#9b8a82]' : 'text-[11px] font-bold text-[#b84c2b] dark:text-[#e8816a]'}>{formatGrowthLabel(weekly.growthPercent)}</span>
        </div>
        <div className="mb-2 h-1 overflow-hidden rounded-full bg-[rgba(26,23,20,0.07)] dark:bg-white/8">
          <div className="h-full rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" style={{ width: `${weekly.progressPercent}%` }} />
        </div>
        <div className="text-[10.5px] text-[#b0a097] dark:text-[#6b6460]">{formatNumber(weekly.xpToNextTier)} XP to next tier</div>
      </SidebarCard>

      <SidebarCard>
        <SidebarCardHeader icon={<SparklesIcon size={14} className="text-[#b84c2b] dark:text-[#e8816a]" />} title="Scoring" />
        {scoringRules.map((rule) => (
          <div key={rule.source} className="flex items-center justify-between gap-4 border-b border-[#ece3db] py-2 last:border-b-0 dark:border-white/[0.07]">
            <span className="text-[12px] text-[#6b5f58] dark:text-[#9b9a92]">{rule.label}</span>
            <span className="shrink-0 font-['DM_Mono',monospace] text-[11px] font-bold text-[#b84c2b] tabular-nums dark:text-[#e8816a]">{rule.xpLabel}</span>
          </div>
        ))}
      </SidebarCard>

      <SidebarCard>
        <SidebarCardHeader icon={<TrophyIcon size={14} className="text-[#c49a2c]" />} title="Streak champions" />
        {streakChampions.length > 0 ? (
          streakChampions.map((entry) => (
            <div key={entry.userId} className="flex items-center gap-2.5 border-b border-[#ece3db] py-[9px] last:border-b-0 dark:border-white/[0.07]">
              <LeaderboardAvatar initials={entry.initials} color={entry.avatarColor} avatarUrl={entry.avatarUrl} name={entry.name} size="sm" />
              <span className="flex-1 truncate text-[12.5px] text-[#1a1714] dark:text-[#f2f0eb]">{entry.name}</span>
              <span className="flex items-center gap-1 font-['DM_Mono',monospace] text-[11px] text-[#b0a097] tabular-nums dark:text-[#6b6460]"><FireIcon size={11} /> {entry.streak}</span>
            </div>
          ))
        ) : (
          <p className="text-[12px] leading-relaxed text-[#9b8a82] dark:text-[#6b6460]">No streak champions are available yet.</p>
        )}
      </SidebarCard>

      <div className="rounded-2xl bg-[#b84c2b] p-5 dark:bg-[#c65f43]">
        <div className="mb-2.5 flex items-center gap-2">
          <StarIcon size={13} className="text-[rgba(255,255,255,0.75)]" />
          <span className="font-['Playfair_Display',serif] text-[14.5px] font-extrabold text-white">{reward.title}</span>
        </div>
        <p className="mb-4 text-[11.5px] leading-[1.6] text-[rgba(255,255,255,0.8)]">{reward.description}</p>
        <button
          type="button"
          onClick={() => navigate(LEADERBOARD_ROUTES.rewards)}
          className="flex w-full items-center justify-center gap-1.5 rounded-[9px] border border-white/20 bg-white/12 py-2.5 text-[12px] font-bold text-white transition-colors hover:bg-white/22 active:scale-[0.98]"
        >
          View rewards <ChevronRightIcon />
        </button>
      </div>
    </aside>
  )
}
