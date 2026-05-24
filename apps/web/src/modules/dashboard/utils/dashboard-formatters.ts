export const formatCompactNumber = (
  value: number | string | null | undefined
) => {
  const numeric = Number(value ?? 0)

  if (!Number.isFinite(numeric)) return '0'

  return new Intl.NumberFormat(undefined, {
    notation: numeric >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: numeric >= 1000 ? 1 : 0,
  }).format(numeric)
}

export const formatStudyMinutes = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`
}

export const formatRelativeTime = (
  value: string | Date | null | undefined
) => {
  if (!value) return 'Recently'

  const date = new Date(value)
  const time = date.getTime()

  if (Number.isNaN(time)) return 'Recently'

  const diffMs = Date.now() - time
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hr ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  }

  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 5) {
    return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const getInitials = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const formatLevelLabel = (isPremium: boolean) =>
  isPremium ? 'Imminiq Pro' : 'Free Scholar'
