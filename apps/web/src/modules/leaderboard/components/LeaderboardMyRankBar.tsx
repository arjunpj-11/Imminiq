import type { LeaderboardCurrentUser } from '../types/leaderboard.types'
import {
  formatNumber,
  formatTargetRankMessage,
} from '../utils/leaderboard-formatters'
import LeaderboardAvatar from './LeaderboardAvatar'
import LeaderboardTrendBadge from './LeaderboardTrendBadge'

export default function LeaderboardMyRankBar({
  entry,
}: {
  entry: LeaderboardCurrentUser
}) {
  return (
    <section className="flex items-center gap-4 rounded-2xl border-[1.5px] border-[rgba(184,76,43,0.2)] bg-[#fdf8f5] px-5 py-4 dark:border-[rgba(232,129,106,0.2)] dark:bg-[#1e1c19]" aria-label="Your leaderboard rank">
      <div className="w-13 shrink-0">
        <div className="mb-0.5 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#b0a097] dark:text-[#6b6460]">Rank</div>
        <div className="font-['Playfair_Display',serif] text-[28px] font-black leading-none text-[#b84c2b] tabular-nums dark:text-[#e8816a]">{entry.rank}</div>
      </div>

      <div className="h-10 w-px shrink-0 bg-[#e0d0c5] dark:bg-white/10" />

      <LeaderboardAvatar
        initials={entry.initials}
        color={entry.avatarColor}
        avatarUrl={entry.avatarUrl}
        name={entry.name}
      />

      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
          {entry.name}
          <span className="ml-1.5 font-['DM_Mono',monospace] text-[10px] font-normal text-[#b84c2b] dark:text-[#e8816a]">you</span>
        </div>
        <div className="mt-0.5 text-[11px] text-[#b0a097] dark:text-[#6b6460]">
          {formatTargetRankMessage(entry.xpToTargetRank, entry.targetRank)}
        </div>
      </div>

      <div className="hidden shrink-0 text-right min-[480px]:block">
        <div className="font-['DM_Mono',monospace] text-[14px] font-bold text-[#1a1714] tabular-nums dark:text-[#f2f0eb]">{formatNumber(entry.totalXp)}</div>
        <div className="mt-px text-[9.5px] uppercase tracking-wider text-[#b0a097] dark:text-[#6b6460]">Total XP</div>
      </div>

      <div className="shrink-0 rounded-lg border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-2.5 py-1.5">
        <LeaderboardTrendBadge trend={entry.trend} />
      </div>
    </section>
  )
}
