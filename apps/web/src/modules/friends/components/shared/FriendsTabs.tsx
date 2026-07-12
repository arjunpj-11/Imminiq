import PillTabs from '../../../../components/navigation/PillTabs'
import type { FriendsTab } from '../../types/friends.types'
import { FriendsIcon, UserPlusIcon } from '../icons/FriendsIcons'

interface IFriendsTabsProps {
  activeTab: FriendsTab
  friendsCount: number
  pendingCount: number
  onChange: (tab: FriendsTab) => void
}

export default function FriendsTabs({
  activeTab,
  friendsCount,
  pendingCount,
  onChange,
}: IFriendsTabsProps) {
  return (
    <PillTabs
      value={activeTab}
      onValueChange={onChange}
      ariaLabel="Friends sections"
      className="flex w-full gap-2 rounded-md border-[#e8ddd6] bg-white/45 p-1.5 dark:border-white/8 dark:bg-white/3"
      itemClassName="min-w-0 flex-1"
      items={[
        {
          value: 'friends',
          label: 'My Friends',
          icon: <FriendsIcon />,
          count: Math.max(0, friendsCount),
        },
        {
          value: 'requests',
          label: 'Friend Invites',
          icon: <UserPlusIcon />,
          count: Math.max(0, pendingCount),
        },
      ]}
    />
  )
}
