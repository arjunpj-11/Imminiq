import { LEADERBOARD_SECTION_LABELS } from '../constants/leaderboard.constants'
import type {
  LeaderboardCurrentUser,
  LeaderboardEntry,
  LeaderboardSection,
} from '../types/leaderboard.types'
import { formatNumber } from '../utils/leaderboard-formatters'
import { cn } from '../utils/leaderboard-ui'
import LeaderboardAvatar from './LeaderboardAvatar'
import LeaderboardTrendBadge from './LeaderboardTrendBadge'
import { FireIcon } from './icons/LeaderboardIcons'

const TrackBadge = ({ track }: { track: string }) => (
  <span className="rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.07)] px-2 py-[2.5px] font-mono text-[8px] uppercase leading-none tracking-widest text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:text-(--brand-500)">
    {track}
  </span>
)

function TableHeader({ section }: { section: LeaderboardSection }) {
  return (
    <div className="flex items-center gap-4 border-b border-[#e8ddd6] bg-[rgba(26,23,20,0.02)] px-5 py-2.25 dark:border-white/8 dark:bg-white/2">
      <span className="w-9 shrink-0 text-center font-mono text-[7.5px] uppercase tracking-[0.14em] text-[#b0a097] dark:text-[#6b6460]">#</span>
      <span className="w-9.5 shrink-0" />
      <span className="flex-1 font-mono text-[7.5px] uppercase tracking-[0.14em] text-[#b0a097] dark:text-[#6b6460]">
        {LEADERBOARD_SECTION_LABELS[section].singular}
      </span>
      <span className="hidden w-17 shrink-0 text-right font-mono text-[7.5px] uppercase tracking-[0.14em] text-[#b0a097] min-[480px]:block dark:text-[#6b6460]">Score</span>
      <span className="hidden w-14 shrink-0 text-right font-mono text-[7.5px] uppercase tracking-[0.14em] text-[#b0a097] min-[560px]:block dark:text-[#6b6460]">Streak</span>
      <span className="w-10 shrink-0 text-right font-mono text-[7.5px] uppercase tracking-[0.14em] text-[#b0a097] dark:text-[#6b6460]">Δ</span>
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-[#e8ddd6] bg-[rgba(26,23,20,0.018)] px-5 py-2.5 dark:border-white/8 dark:bg-white/[0.018]">
      <span className="select-none font-mono text-[8px] uppercase tracking-[0.14em] text-[#b0a097] dark:text-[#6b6460]">{label}</span>
      <div className="h-px flex-1 bg-[#e8ddd6] dark:bg-white/8" />
    </div>
  )
}

function LeaderRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 border-b border-[#ece3db] px-5 py-2.75 last:border-b-0 dark:border-white/6',
        entry.isMe
          ? 'bg-[rgba(184,76,43,0.032)] dark:bg-[rgba(232,129,106,0.045)]'
          : 'transition-colors duration-100 hover:bg-[rgba(26,23,20,0.015)] dark:hover:bg-white/1.5',
      )}
    >
      <span className={cn("w-9 shrink-0 text-center font-mono text-[12.5px] font-bold tabular-nums", entry.isMe ? 'text-(--brand-500) dark:text-(--brand-500)' : 'text-[#c4b8b0] dark:text-[#5a5550]')}>
        {entry.rank}
      </span>

      <LeaderboardAvatar
        initials={entry.initials}
        color={entry.avatarColor}
        avatarUrl={entry.avatarUrl}
        name={entry.name}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cn('truncate text-[13px] font-semibold', entry.isMe ? 'text-(--text-primary) dark:text-(--text-primary)' : 'text-[#2a2420] dark:text-[#dedad5]')}>
            {entry.name}
            {entry.isMe && (
              <span className="ml-1.5 font-mono text-[10px] font-normal text-(--brand-500) dark:text-(--brand-500)">you</span>
            )}
          </span>
          <TrackBadge track={entry.track} />
        </div>
        <div className="mt-px text-[11px] text-[#b0a097] dark:text-[#6b6460]">{entry.handle}</div>
      </div>

      <div className="hidden w-17 shrink-0 text-right min-[480px]:block">
        <div className="font-mono text-[13px] font-bold text-(--text-primary) tabular-nums dark:text-(--text-primary)">{formatNumber(entry.xp)}</div>
        <div className="mt-px text-[9px] uppercase tracking-wider text-[#b0a097] dark:text-[#6b6460]">XP</div>
      </div>

      <div className="hidden w-14 shrink-0 items-center justify-end gap-1 text-[11px] text-[#b0a097] min-[560px]:flex dark:text-[#6b6460]">
        <FireIcon size={11} /> {entry.streak}d
      </div>

      <div className="w-10 shrink-0 text-right">
        <LeaderboardTrendBadge trend={entry.trend} />
      </div>
    </div>
  )
}

interface LeaderboardTableProps {
  section: LeaderboardSection
  entries: LeaderboardEntry[]
  currentUser: LeaderboardCurrentUser | null
}

export default function LeaderboardTable({
  section,
  entries,
  currentUser,
}: LeaderboardTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border-[1.5px] border-(--border-subtle) bg-(--surface-card) dark:border-(--border-subtle) dark:bg-(--surface-card)" aria-label={`${LEADERBOARD_SECTION_LABELS[section].label} rankings`}>
      <TableHeader section={section} />

      {entries.length > 0 ? (
        entries.map((entry) => <LeaderRow key={entry.userId} entry={entry} />)
      ) : (
        <div className="py-12 text-center text-[13px] text-[#b0a097] dark:text-[#6b6460]">
          No ranked participants are available for this scope yet.
        </div>
      )}

      {currentUser && !entries.some((entry) => entry.userId === currentUser.userId) && (
        <>
          <SectionDivider label="Your position" />
          <LeaderRow entry={currentUser} />
        </>
      )}
    </section>
  )
}
