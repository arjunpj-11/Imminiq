import PillTabs from '../../../components/navigation/PillTabs'
import { ACTIVITY_FILTER_OPTIONS } from '../constants/activity.constants'
import type { ActivityFeedFilter } from '../types/activity.types'
import {
  ActivityIcon,
  ClipboardCheckIcon,
  GraduationCapIcon,
  UsersIcon,
} from './icons/ActivityIcons'

interface IActivityFilterTabsProps {
  activeFilter: ActivityFeedFilter
  disabled?: boolean
  onChange: (filter: ActivityFeedFilter) => void
}

const filterIcon = (filter: ActivityFeedFilter) => {
  switch (filter) {
    case 'trackers':
      return <GraduationCapIcon size={12} />
    case 'mock_tests':
      return <ClipboardCheckIcon size={12} />
    case 'community':
      return <UsersIcon size={12} />
    default:
      return <ActivityIcon size={12} />
  }
}

export default function ActivityFilterTabs({
  activeFilter,
  disabled = false,
  onChange,
}: IActivityFilterTabsProps) {
  return (
    <PillTabs
      value={activeFilter}
      onValueChange={onChange}
      ariaLabel="Activity filter"
      className="w-fit rounded-xl p-0.75"
      itemClassName="font-mono text-[10px] font-bold uppercase tracking-[0.06em]"
      items={ACTIVITY_FILTER_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        icon: filterIcon(option.value),
        disabled,
      }))}
    />
  )
}
