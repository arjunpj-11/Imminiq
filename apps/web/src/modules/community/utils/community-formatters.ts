export const getInitials = (name?: string | null) => {
  const clean = name?.trim()

  if (!clean) return 'IM'

  return clean
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export const formatLevelLabel = (isPremium?: boolean) => {
  return isPremium ? 'Imminiq Pro' : 'Free Scholar'
}

export const formatCompactNumber = (value: number) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
  }

  return String(value)
}

export const formatProgress = (value: number) => {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`
}

export const getApiErrorMessage = (
  fallback: string,
  message?: string,
) => {
  return message?.trim() || fallback
}
