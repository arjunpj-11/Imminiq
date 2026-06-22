import type { CommunityLeaderboardEntry } from '../types/community.types'
import { cn } from '../utils/community-ui'
import { TrophyIcon } from './icons/CommunityIcons'

interface VerificationLeaderboardProps {
  entries: CommunityLeaderboardEntry[]
}

export default function VerificationLeaderboard({
  entries,
}: VerificationLeaderboardProps) {
  return (
    <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[#c49a2c]">
          <TrophyIcon />
        </span>
        <span className="font-['Playfair_Display',serif] text-[14px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
          Top verifiers
        </span>
      </div>

      <div className="flex flex-col">
        {entries.length > 0 ? (
          entries.map(({ rank, name, earned, badge, isMe }) => (
            <div
              key={`${rank}-${name}`}
              className={cn(
                'flex items-center gap-2.5 border-b border-[#e8ddd6] py-2.5 last:border-b-0 dark:border-white/8',
                isMe &&
                  '-mx-2 rounded-lg bg-[rgba(184,76,43,0.05)] px-2 dark:bg-[rgba(232,129,106,0.05)]',
              )}
            >
              <span className="w-5 shrink-0 text-center text-[15px]">
                {badge}
              </span>
              <span
                className={cn(
                  'min-w-0 flex-1 truncate text-[12.5px]',
                  isMe
                    ? 'font-bold text-[#b84c2b] dark:text-[#e8816a]'
                    : 'text-[#1a1714] dark:text-[#f2f0eb]',
                )}
              >
                {name}
                {isMe ? ' (you)' : ''}
              </span>
              <span className="shrink-0 font-['DM_Mono',monospace] text-[11px] text-[#9b9a92]">
                {earned}
              </span>
            </div>
          ))
        ) : (
          <p className="text-[12px] leading-normal text-[#9b9a92]">
            No verifier rankings yet.
          </p>
        )}
      </div>
    </div>
  )
}
