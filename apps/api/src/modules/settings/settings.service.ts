import { settingsRepository } from './settings.repository'
import {
  UpdateAppearancePayload,
  UpdateNotificationsPayload,
  UpdatePrivacyPayload,
  UpdateCodeEditorPayload,
  UpdateCompilerPayload,
  UpdateAIBehaviourPayload,
  UpdateLearningJourneyPayload,
  UpdateGesturesPayload,
  UpdateQuietHoursPayload,
  UpdateEmailDigestPayload,
  UpdateAccountPayload,
} from './settings.types'

export const settingsService = {
  getAllSettings: async (userId: string) => {
    return settingsRepository.findOrCreate(userId)
  },

  getAppearanceSettings: async (userId: string) => {
    const settings = await settingsRepository.findOrCreate(userId)
    return settings.appearance
  },

  getNotificationSettings: async (userId: string) => {
    const settings = await settingsRepository.findOrCreate(userId)
    return settings.notifications
  },

  getPrivacySettings: async (userId: string) => {
    const settings = await settingsRepository.findOrCreate(userId)
    return settings.privacy
  },

  getGestureSettings: async (userId: string) => {
    const settings = await settingsRepository.findOrCreate(userId)
    return settings.gestures
  },

  updateAccountSettings: async (
    userId: string,
    payload: UpdateAccountPayload
  ) => {
    return settingsRepository.updateAccountSettings(userId, payload)
  },

  updateAppearance: async (
    userId: string,
    payload: UpdateAppearancePayload
  ) => {
    return settingsRepository.updateAppearance(userId, payload)
  },

  updateNotifications: async (
    userId: string,
    payload: UpdateNotificationsPayload
  ) => {
    const { types, ...rest } = payload

    if (Object.keys(rest).length > 0) {
      await settingsRepository.updateNotifications(userId, rest)
    }

    if (types && Object.keys(types).length > 0) {
      await settingsRepository.updateNotificationTypes(userId, types)
    }

    return settingsRepository.findOrCreate(userId)
  },

  updateQuietHours: async (
    userId: string,
    payload: UpdateQuietHoursPayload
  ) => {
    return settingsRepository.updateQuietHours(userId, payload)
  },

  updateEmailDigest: async (
    userId: string,
    payload: UpdateEmailDigestPayload
  ) => {
    return settingsRepository.updateEmailDigest(userId, payload)
  },

  updatePrivacy: async (
    userId: string,
    payload: UpdatePrivacyPayload
  ) => {
    return settingsRepository.updatePrivacy(userId, payload)
  },

  updateCodeEditor: async (
    userId: string,
    payload: UpdateCodeEditorPayload
  ) => {
    return settingsRepository.updateCodeEditor(userId, payload)
  },

  updateCompiler: async (
    userId: string,
    payload: UpdateCompilerPayload
  ) => {
    return settingsRepository.updateCompiler(userId, payload)
  },

  updateAIBehaviour: async (
    userId: string,
    payload: UpdateAIBehaviourPayload
  ) => {
    return settingsRepository.updateAIBehaviour(userId, payload)
  },

  updateLearningJourney: async (
    userId: string,
    payload: UpdateLearningJourneyPayload
  ) => {
    return settingsRepository.updateLearningJourney(userId, payload)
  },

  updateGestures: async (
    userId: string,
    payload: UpdateGesturesPayload
  ) => {
    return settingsRepository.updateGestures(userId, payload)
  },

  updateCookieConsent: async (
    userId: string,
    cookieConsent: boolean
  ) => {
    return settingsRepository.updateCookieConsent(userId, cookieConsent)
  },

  acceptTerms: async (userId: string) => {
    return settingsRepository.acceptTerms(userId)
  },

  resetToDefaults: async (userId: string) => {
    return settingsRepository.resetToDefaults(userId)
  },
}