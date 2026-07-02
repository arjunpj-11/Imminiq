import UserAvatar from '../../../components/data-display/UserAvatar'

interface FriendsAvatarProps {
  fullName: string
  avatarUrl?: string | null
  size?: 'sm' | 'md'
}

export default function FriendsAvatar({
  fullName,
  avatarUrl,
  size = 'md',
}: FriendsAvatarProps) {
  return (
    <UserAvatar
      name={fullName}
      src={avatarUrl}
      sizeClassName={
        size === 'sm' ? 'h-9 w-9 text-[10px]' : 'h-11 w-11 text-[12px]'
      }
      className="ring-1 ring-[#e0d0c5] dark:ring-white/10"
      fallbackClassName="font-['DM_Mono',monospace]"
      imageLoading="lazy"
    />
  )
}
