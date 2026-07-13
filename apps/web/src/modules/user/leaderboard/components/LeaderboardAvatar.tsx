import UserAvatar from '../../../../components/data-display/UserAvatar'
import { Link } from 'react-router-dom'

interface ILeaderboardAvatarProps {
  initials: string
  color: string
  avatarUrl?: string | null | undefined
  name: string
  username: string
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
  username,
  size = 'md',
}: ILeaderboardAvatarProps) {
  return (
    <Link
      to={`/profile/${username}`}
      aria-label={`Open ${name}'s public profile`}
      className="shrink-0 rounded-full transition hover:ring-2 hover:ring-(--brand-500)/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-500)"
    >
      <UserAvatar
        name={name}
        src={avatarUrl}
        initials={initials}
        sizeClassName={sizes[size]}
        fallbackClassName="bg-none font-mono tracking-tight text-white"
        fallbackStyle={{ background: color }}
        imageLoading="lazy"
      />
    </Link>
  )
}
