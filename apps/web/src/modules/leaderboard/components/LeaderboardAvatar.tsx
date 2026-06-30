import { cn } from '../utils/leaderboard-ui'

interface LeaderboardAvatarProps {
  initials: string
  color: string
  avatarUrl?: string | null | undefined
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-[38px] w-[38px] text-[12px]',
  lg: 'h-[52px] w-[52px] text-[15px]',
  xl: 'h-[76px] w-[76px] text-[21px]',
} as const

export default function LeaderboardAvatar({
  initials,
  color,
  avatarUrl,
  name,
  size = 'md',
}: LeaderboardAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${name}'s avatar`}
        className={cn('shrink-0 rounded-full object-cover', sizes[size])}
        loading="lazy"
      />
    )
  }

  return (
    <div
      aria-label={`${name}'s initials`}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-['DM_Mono',monospace] font-bold tracking-tight text-white",
        sizes[size],
      )}
      style={{ background: color }}
    >
      {initials}
    </div>
  )
}
