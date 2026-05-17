const BLOCKED_APPEAL_IDENTIFIER_KEY = 'blocked_appeal_identifier'

export const getBlockedAppealIdentifier = () => {
  if (typeof window === 'undefined') {
    return ''
  }

  return sessionStorage.getItem(BLOCKED_APPEAL_IDENTIFIER_KEY) || ''
}

export const saveBlockedAppealIdentifier = (identifier: string) => {
  if (typeof window === 'undefined') {
    return
  }

  const normalizedIdentifier = identifier.trim()

  if (!normalizedIdentifier) {
    return
  }

  sessionStorage.setItem(
    BLOCKED_APPEAL_IDENTIFIER_KEY,
    normalizedIdentifier
  )
}

export const clearBlockedAppealIdentifier = () => {
  if (typeof window === 'undefined') {
    return
  }

  sessionStorage.removeItem(BLOCKED_APPEAL_IDENTIFIER_KEY)
}