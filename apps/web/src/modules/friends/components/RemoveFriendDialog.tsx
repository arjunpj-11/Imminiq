import ConfirmDialog from '../../../components/overlays/ConfirmDialog'
import type { IFriendUser } from '../types/friends.types'
import FriendsAvatar from './FriendsAvatar'

interface IRemoveFriendDialogProps {
  friend: IFriendUser | null
  removing: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function RemoveFriendDialog({
  friend,
  removing,
  onCancel,
  onConfirm,
}: IRemoveFriendDialogProps) {
  if (!friend) return null

  return (
    <ConfirmDialog
      open
      title={`Remove ${friend.fullName}?`}
      description={
        <>
          <span className="mb-2 block text-[12px] text-[#9b9a92]">
            {friend.fullName} · {friend.handle}
          </span>
          They will be removed from your friends list and from your Friends
          leaderboard audience. You can send another invite later.
        </>
      }
      icon={
        <FriendsAvatar
          fullName={friend.fullName}
          {...(friend.avatarUrl !== undefined
            ? { avatarUrl: friend.avatarUrl }
            : {})}
        />
      }
      confirmText="Remove friend"
      cancelText="Keep friend"
      variant="danger"
      isLoading={removing}
      onClose={onCancel}
      onConfirm={onConfirm}
    />
  )
}
