import { isAxiosError } from 'axios'

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

type ApiErrorResponse = {
  message?: string
}

export const getApiErrorMessage = (
  fallback: string,
  errorOrMessage?: unknown,
) => {
  if (typeof errorOrMessage === 'string') {
    return errorOrMessage.trim() || fallback
  }

  if (isAxiosError<ApiErrorResponse>(errorOrMessage)) {
    return errorOrMessage.response?.data?.message?.trim() || fallback
  }

  if (errorOrMessage instanceof Error) {
    return errorOrMessage.message.trim() || fallback
  }

  return fallback
}