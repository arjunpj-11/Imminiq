import type {
  ILeaderboardReward,
  ILeaderboardScoringRule,
  LeaderboardSection,
} from '../types/leaderboard.types';
import { formatNumber } from '../utils/leaderboard-formatters';
import { cn } from '../utils/leaderboard-ui';
import {
  ChalkBoardIcon,
  GraduationCapIcon,
  SparklesIcon,
  StarIcon,
} from './icons/LeaderboardIcons';

interface IRewardSectionProps {
  section: LeaderboardSection;
  scoringRules: ILeaderboardScoringRule[];
  reward: ILeaderboardReward;
}

export default function LeaderboardRewardsView({
  section,
  scoringRules,
  reward,
}: IRewardSectionProps) {
  const isStudents = section === 'students';

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <section className="overflow-hidden rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) dark:border-(--border-subtle) dark:bg-(--surface-card)">
        <div className="flex items-center gap-3 border-b border-[#e8ddd6] px-6 py-5 dark:border-white/8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(184,76,43,0.1)] text-(--brand-500) dark:bg-[rgba(232,129,106,0.12)] dark:text-(--brand-500)">
            {isStudents ? <GraduationCapIcon /> : <ChalkBoardIcon />}
          </div>
          <div>
            <h2 className="font-ui text-[19px] font-black text-(--text-primary) dark:text-(--text-primary)">
              How to earn {isStudents ? 'student' : 'trainer'} XP
            </h2>
            <p className="mt-0.5 text-[12px] text-[#8a7d75] dark:text-[#77706b]">
              XP is recorded by the backend when an eligible activity is completed.
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#ece3db] dark:divide-white/[0.07]">
          {scoringRules.map((rule, index) => (
            <div key={rule.source} className="flex items-center gap-4 px-6 py-5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(184,76,43,0.07)] font-mono text-[11px] font-bold text-(--brand-500) dark:bg-[rgba(232,129,106,0.08)] dark:text-(--brand-500)">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-[#2a2420] dark:text-[#dedad5]">
                  {rule.label}
                </div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-[#b0a097] dark:text-[#6b6460]">
                  {rule.source.replaceAll('_', ' ')}
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.07)] px-3 py-1.5 font-mono text-[11px] font-bold text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:text-(--brand-500)">
                {rule.xpLabel}
              </span>
            </div>
          ))}
        </div>
      </section>

      <aside
        className={cn(
          'relative overflow-hidden rounded-xl p-6 text-white shadow-[0_16px_45px_rgba(184,76,43,0.22)]',
          isStudents ? 'bg-(--brand-500)' : 'bg-[#7c3a2d]'
        )}
      >
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/8" />
        <div className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-black/8" />
        <div className="relative">
          <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10">
            <StarIcon size={18} />
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/65">
            Weekly distinction
          </div>
          <h2 className="mt-2 font-ui text-[28px] font-black leading-tight">{reward.title}</h2>
          <p className="mt-4 text-[13px] leading-[1.7] text-white/80">{reward.description}</p>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/12 bg-white/8 p-4">
              <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/60">
                Target
              </div>
              <div className="mt-2 font-ui text-[24px] font-black">Top {reward.targetRank}</div>
            </div>
            <div className="rounded-xl border border-white/12 bg-white/8 p-4">
              <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/60">
                Coins
              </div>
              <div className="mt-2 font-ui text-[24px] font-black">
                {formatNumber(reward.coins)}
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-white/12 bg-white/8 p-4">
            <div className="flex items-center gap-2 text-white/70">
              <SparklesIcon size={13} />
              <span className="font-mono text-[8px] uppercase tracking-[0.12em]">Badge reward</span>
            </div>
            <div className="mt-2 text-[15px] font-bold">{reward.badgeName}</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
