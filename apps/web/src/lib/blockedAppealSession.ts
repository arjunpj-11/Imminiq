import { STORAGE_KEYS } from './storage/storage-keys'
import { safeSessionStorage } from './storage/safe-storage'

export const getBlockedAppealIdentifier = () =>
  safeSessionStorage.get(STORAGE_KEYS.blockedAppealIdentifier) || ''

export const saveBlockedAppealIdentifier = (identifier: string) => {
  const normalizedIdentifier = identifier.trim()
  if (!normalizedIdentifier) return

  safeSessionStorage.set(
    STORAGE_KEYS.blockedAppealIdentifier,
    normalizedIdentifier,
  )
}

export const clearBlockedAppealIdentifier = () => {
  safeSessionStorage.remove(STORAGE_KEYS.blockedAppealIdentifier)
}
