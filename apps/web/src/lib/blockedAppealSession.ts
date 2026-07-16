import { STORAGE_KEYS } from './storage/storage-keys';
import { safeSessionStorage } from './storage/safe-storage';

export const getBlockedAppealIdentifier = () =>
  safeSessionStorage.get(STORAGE_KEYS.blockedAppealIdentifier) || '';

export const saveBlockedAppealIdentifier = (identifier: string) => {
  const normalizedIdentifier = identifier.trim();
  if (!normalizedIdentifier) return;

  safeSessionStorage.set(STORAGE_KEYS.blockedAppealIdentifier, normalizedIdentifier);
};

export const clearBlockedAppealIdentifier = () => {
  safeSessionStorage.remove(STORAGE_KEYS.blockedAppealIdentifier);
  safeSessionStorage.remove(STORAGE_KEYS.blockedAppealToken);
  safeSessionStorage.remove(STORAGE_KEYS.blockedModerationMessage);
};

export const getBlockedAppealToken = () =>
  safeSessionStorage.get(STORAGE_KEYS.blockedAppealToken) || '';

export const saveBlockedAppealToken = (token: string) => {
  if (token) safeSessionStorage.set(STORAGE_KEYS.blockedAppealToken, token);
};

export const getBlockedModerationMessage = () =>
  safeSessionStorage.get(STORAGE_KEYS.blockedModerationMessage) || '';

export const saveBlockedModerationMessage = (message: string) => {
  const normalized = message.trim();
  if (normalized) safeSessionStorage.set(STORAGE_KEYS.blockedModerationMessage, normalized);
};
