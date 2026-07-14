import UserAvatar from '../../../../../components/data-display/UserAvatar';

interface IFriendsAvatarProps {
  fullName: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md';
}

export default function FriendsAvatar({ fullName, avatarUrl, size = 'md' }: IFriendsAvatarProps) {
  return (
    <UserAvatar
      name={fullName}
      src={avatarUrl}
      sizeClassName={size === 'sm' ? 'h-9 w-9 text-[10px]' : 'h-11 w-11 text-[12px]'}
      className="ring-1 ring-(--border-subtle) dark:ring-white/10"
      fallbackClassName="font-mono"
      imageLoading="lazy"
    />
  );
}
