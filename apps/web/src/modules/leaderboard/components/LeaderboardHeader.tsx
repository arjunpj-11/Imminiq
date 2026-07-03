import {
  formatRank,
  formatRankTrendHint,
} from '../utils/leaderboard-formatters'
import { LiveDotIcon } from './icons/LeaderboardIcons'

interface LeaderboardHeaderProps {
  globalRank: number | null
  globalRankTrend: number
}

export default function LeaderboardHeader({
  globalRank,
  globalRankTrend,
}: LeaderboardHeaderProps) {
  return (
    <section className="flex flex-wrap items-start justify-between gap-5">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(184,76,43,0.15)] bg-[rgba(184,76,43,0.07)] px-3 py-1.25">
          <LiveDotIcon />
          <span className="font-mono text-[8.5px] uppercase tracking-[0.13em] text-(--brand-500) dark:text-(--brand-500)">Compete</span>
        </div>
        <h1 className="font-ui text-[clamp(28px,3.5vw,40px)] font-black leading-[1.08] tracking-[-0.5px] text-(--text-primary) dark:text-(--text-primary)">
          Arena <span className="text-(--brand-500) dark:text-(--brand-500)">Leaderboard</span>
        </h1>
        <p className="mt-2.5 max-w-105 text-[13px] italic leading-[1.6] text-[#7a6e66] dark:text-(--text-secondary)">
          Track top learners, weekly streaks, and progress across the Imminiq community.
        </p>
      </div>

      <div className="group relative w-65 max-[560px]:w-full overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.20)] hover:shadow-(--shadow-2) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:hover:border-white/20">
        <div className="absolute inset-x-0 top-0 h-[2.5px] bg-[linear-gradient(90deg,transparent,var(--brand-500),transparent)] dark:bg-[linear-gradient(90deg,transparent,var(--brand-500),transparent)]" />
        <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--text-secondary) opacity-70 dark:text-(--text-secondary)">Global rank</div>
        <div className="mt-4 font-ui text-[34px] font-black leading-none tracking-[-1.5px] text-(--text-primary) dark:text-(--text-primary)">{formatRank(globalRank)}</div>
        <p className="mt-3 text-[12px] leading-normal text-(--text-secondary) dark:text-[#6b6560]">{globalRank === null ? 'Earn XP to enter the leaderboard' : formatRankTrendHint(globalRankTrend)}</p>
      </div>
    </section>
  )
}
