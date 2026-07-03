import UserAvatar from '../../../components/data-display/UserAvatar'

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
  return (
    <UserAvatar
      name={name}
      src={avatarUrl}
      initials={initials}
      sizeClassName={sizes[size]}
      fallbackClassName="bg-none font-mono tracking-tight text-white"
      fallbackStyle={{ background: color }}
      imageLoading="lazy"
    />
  )
}
