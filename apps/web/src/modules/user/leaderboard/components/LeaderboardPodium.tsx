import type { ILeaderboardTopThreeEntry } from '../types/leaderboard.types';
import { formatNumber } from '../utils/leaderboard-formatters';
import { cn } from '../utils/leaderboard-ui';
import LeaderboardAvatar from './LeaderboardAvatar';
import { FireIcon, MedalIcon } from './icons/LeaderboardIcons';

const podiumTokens = {
  1: {
    border: 'border-[rgba(196,154,44,0.45)] dark:border-[rgba(230,190,80,0.35)]',
    shadow: 'shadow-[0_8px_36px_rgba(196,154,44,0.14)]',
    background: 'bg-[#fffdf5] dark:bg-[#1e1c14]',
    lightStrip: 'linear-gradient(90deg, transparent, #c49a2c, transparent)',
    darkStrip: 'linear-gradient(90deg, transparent, #e6be50, transparent)',
    ring: '#c49a2c',
    lightXp: '#a07a18',
    darkXp: '#e6be50',
    streakText: '#7c5a1e',
    streakBackground: 'rgba(196,154,44,0.10)',
    streakBorder: 'rgba(196,154,44,0.30)',
  },
  2: {
    border: 'border-[rgba(155,154,146,0.40)] dark:border-[rgba(200,200,195,0.25)]',
    shadow: 'shadow-[0_6px_28px_rgba(155,154,146,0.12)]',
    background: 'bg-[var(--surface-card)] dark:bg-[var(--surface-card)]',
    lightStrip: 'linear-gradient(90deg, transparent, #9b9a92, transparent)',
    darkStrip: 'linear-gradient(90deg, transparent, #c8c8c3, transparent)',
    ring: '#9b9a92',
    lightXp: '#6b6a62',
    darkXp: '#b8b8b3',
    streakText: '#6b6a62',
    streakBackground: 'rgba(155,154,146,0.09)',
    streakBorder: 'rgba(155,154,146,0.28)',
  },
  3: {
    border: 'border-[rgba(184,115,51,0.38)] dark:border-[rgba(210,145,80,0.28)]',
    shadow: 'shadow-[0_6px_24px_rgba(184,115,51,0.10)]',
    background: 'bg-[var(--surface-card)] dark:bg-[var(--surface-card)]',
    lightStrip: 'linear-gradient(90deg, transparent, #b87333, transparent)',
    darkStrip: 'linear-gradient(90deg, transparent, #d29150, transparent)',
    ring: '#b87333',
    lightXp: '#8a4e1e',
    darkXp: '#d29150',
    streakText: '#7a4a20',
    streakBackground: 'rgba(184,115,51,0.09)',
    streakBorder: 'rgba(184,115,51,0.28)',
  },
} as const;

const podiumOrder: ReadonlyArray<1 | 2 | 3> = [2, 1, 3];

function PodiumCard({ entry }: { entry: ILeaderboardTopThreeEntry }) {
  const token = podiumTokens[entry.rank];
  const isChampion = entry.rank === 1;

  return (
    <article
      className={cn(
        'group relative flex flex-col items-center overflow-hidden rounded-xl border-[1.5px] px-5 pb-6 pt-6 transition-all duration-200',
        token.background,
        token.border,
        token.shadow,
        entry.rank === 1 && 'max-[540px]:order-1',
        entry.rank === 2 && 'max-[540px]:order-2',
        entry.rank === 3 && 'max-[540px]:order-3'
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-[2.5px] dark:hidden"
        style={{ background: token.lightStrip }}
      />
      <div
        className="absolute inset-x-0 top-0 hidden h-[2.5px] dark:block"
        style={{ background: token.darkStrip }}
      />

      <div className="relative mb-3 mt-2">
        <div
          className="rounded-full p-0.75"
          style={{ background: `linear-gradient(135deg, ${token.ring}80, ${token.ring}20)` }}
        >
          <div className="rounded-full bg-(--surface-card) p-0.5 dark:bg-(--surface-card)">
            <LeaderboardAvatar
              initials={entry.initials}
              color={entry.avatarColor}
              avatarUrl={entry.avatarUrl}
              name={entry.name}
              username={entry.username}
              size={isChampion ? 'xl' : 'lg'}
            />
          </div>
        </div>
        <div className="absolute -bottom-2 -right-1 rounded-full border-[2.5px] border-[#fdf8f5] dark:border-[#1e1c19]">
          <MedalIcon rank={entry.rank} />
        </div>
      </div>

      <h3
        className={cn(
          'mt-1 text-center font-ui font-black leading-[1.2] text-(--text-primary) dark:text-(--text-primary)',
          isChampion ? 'text-[19px]' : 'text-[14.5px]'
        )}
      >
        {entry.name}
      </h3>

      <span
        className="mt-1.5 font-mono text-[12px] font-bold tabular-nums dark:hidden"
        style={{ color: token.lightXp }}
      >
        {formatNumber(entry.xp)} XP
      </span>
      <span
        className="mt-1.5 hidden font-mono text-[12px] font-bold tabular-nums dark:inline"
        style={{ color: token.darkXp }}
      >
        {formatNumber(entry.xp)} XP
      </span>

      <div
        className="mt-3 flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.06em]"
        style={{
          color: token.streakText,
          background: token.streakBackground,
          borderColor: token.streakBorder,
        }}
      >
        <FireIcon size={11} />
        {entry.streakDays}-day streak
      </div>
    </article>
  );
}

export default function LeaderboardPodium({ entries }: { entries: ILeaderboardTopThreeEntry[] }) {
  const orderedEntries = podiumOrder
    .map((rank) => entries.find((entry) => entry.rank === rank))
    .filter((entry): entry is ILeaderboardTopThreeEntry => Boolean(entry));

  if (orderedEntries.length === 0) return null;

  return (
    <section
      className="grid grid-cols-3 items-end gap-3 max-[540px]:grid-cols-1"
      aria-label="Top leaderboard positions"
    >
      {orderedEntries.map((entry) => (
        <PodiumCard key={entry.userId} entry={entry} />
      ))}
    </section>
  );
}
