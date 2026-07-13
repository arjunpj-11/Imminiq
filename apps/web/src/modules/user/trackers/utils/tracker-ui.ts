import { cn } from '../../../../lib/cn'
export { cn }

import type { ITracker, TrackerDomain, TrackerStatus } from '../types/tracker.types'

export const themedScrollbar =
  '[scrollbar-width:thin] [scrollbar-color:rgba(184,76,43,0.28)_transparent] dark:[scrollbar-color:rgba(232,129,106,0.34)_transparent] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(184,76,43,0.28)] dark:[&::-webkit-scrollbar-thumb]:bg-[rgba(232,129,106,0.34)]'

export const trackerDomainOptions: Array<{
  label: string
  value: TrackerDomain | 'all'
}> = [
  { label: 'All domains', value: 'all' },
  { label: 'Engineering', value: 'engineering' },
  { label: 'Frontend', value: 'frontend' },
  { label: 'Backend', value: 'backend' },
  { label: 'Algorithms', value: 'algorithms' },
  { label: 'Architecture', value: 'architecture' },
  { label: 'Development', value: 'development' },
  { label: 'Design', value: 'design' },
  { label: 'AI', value: 'ai' },
  { label: 'Other', value: 'other' },
]

export const trackerStatusOptions: Array<{
  label: string
  value: TrackerStatus | 'all'
}> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Stalled', value: 'stalled' },
  { label: 'Completed', value: 'completed' },
  { label: 'Archived', value: 'archived' },
]

export const formatMinutes = (minutes?: number) => {
  const value = Number(minutes || 0)
  if (value < 60) return `${value}m`
  const hours = Math.floor(value / 60)
  const rest = value % 60
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

export const getTrackerInitials = (tracker: Pick<ITracker, 'title'>) => {
  return (
    tracker.title
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'IQ'
  )
}

export const getProgressLabel = (progress?: number) =>
  `${Math.max(0, Math.min(100, Math.round(progress || 0)))}%`
