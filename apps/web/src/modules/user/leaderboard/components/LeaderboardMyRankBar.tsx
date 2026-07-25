import type { ILeaderboardCurrentUser } from '../types/leaderboard.types';
import { formatNumber, formatTargetRankMessage } from '../utils/leaderboard-formatters';
import LeaderboardAvatar from './LeaderboardAvatar';
import LeaderboardTrendBadge from './LeaderboardTrendBadge';

export default function LeaderboardMyRankBar({ entry }: { entry: ILeaderboardCurrentUser }) {
  return (
    <section
      className="flex items-center gap-2.5 sm:gap-4 rounded-2xl border-[1.5px] border-[rgba(184,76,43,0.2)] bg-(--surface-card) px-3 sm:px-5 py-3 sm:py-4 dark:border-[rgba(232,129,106,0.2)] dark:bg-(--surface-card)"
      aria-label="Your leaderboard rank"
    >
      <div className="w-10 sm:w-13 shrink-0">
        <div className="mb-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[#b0a097] dark:text-[#6b6460]">
          Rank
        </div>
        <div className="font-ui text-[22px] sm:text-[28px] font-black leading-none text-(--brand-500) tabular-nums dark:text-(--brand-500)">
          {entry.rank}
        </div>
      </div>

      <div className="h-8 sm:h-10 w-px shrink-0 bg-(--border-subtle) dark:bg-white/10" />

      <div className="shrink-0">
        <LeaderboardAvatar
          initials={entry.initials}
          color={entry.avatarColor}
          avatarUrl={entry.avatarUrl}
          name={entry.name}
          username={entry.username}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] sm:text-[13px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
          {entry.name}
          <span className="ml-1 font-mono text-[9.5px] sm:text-[10px] font-normal text-(--brand-500) dark:text-(--brand-500)">
            you
          </span>
        </div>
        <div className="mt-0.5 truncate text-[10.5px] sm:text-[11px] text-[#b0a097] dark:text-[#6b6460]">
          {formatTargetRankMessage(entry.xpToTargetRank, entry.targetRank)}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="font-mono text-[12px] sm:text-[14px] font-bold text-(--text-primary) tabular-nums dark:text-(--text-primary)">
          {formatNumber(entry.totalXp)}
        </div>
        <div className="mt-px font-mono text-[8.5px] sm:text-[9.5px] uppercase tracking-wider text-[#b0a097] dark:text-[#6b6460]">
          Total XP
        </div>
      </div>

      <div className="shrink-0 rounded-lg border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-2 sm:px-2.5 py-1 sm:py-1.5">
        <LeaderboardTrendBadge trend={entry.trend} />
      </div>
    </section>
  );
}
