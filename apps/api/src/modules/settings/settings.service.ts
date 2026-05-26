import { mongoSettingsRepository } from './infrastructure/repositories/mongo-settings.repository'
import type {
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
} from './domain/types/settings.types'

import { GetAllSettingsUseCase } from './application/use-cases/get-all-settings.usecase'
import { GetAppearanceSettingsUseCase } from './application/use-cases/get-appearance-settings.usecase'
import { GetNotificationSettingsUseCase } from './application/use-cases/get-notification-settings.usecase'
import { GetPrivacySettingsUseCase } from './application/use-cases/get-privacy-settings.usecase'
import { GetGestureSettingsUseCase } from './application/use-cases/get-gesture-settings.usecase'
import { UpdateAccountSettingsUseCase } from './application/use-cases/update-account-settings.usecase'
import { UpdateAppearanceUseCase } from './application/use-cases/update-appearance.usecase'
import { UpdateNotificationsUseCase } from './application/use-cases/update-notifications.usecase'
import { UpdateQuietHoursUseCase } from './application/use-cases/update-quiet-hours.usecase'
import { UpdateEmailDigestUseCase } from './application/use-cases/update-email-digest.usecase'
import { UpdatePrivacyUseCase } from './application/use-cases/update-privacy.usecase'
import { UpdateCodeEditorUseCase } from './application/use-cases/update-code-editor.usecase'
import { UpdateCompilerUseCase } from './application/use-cases/update-compiler.usecase'
import { UpdateAIBehaviourUseCase } from './application/use-cases/update-ai-behaviour.usecase'
import { UpdateLearningJourneyUseCase } from './application/use-cases/update-learning-journey.usecase'
import { UpdateGesturesUseCase } from './application/use-cases/update-gestures.usecase'
import { UpdateCookieConsentUseCase } from './application/use-cases/update-cookie-consent.usecase'
import { AcceptTermsUseCase } from './application/use-cases/accept-terms.usecase'
import { ResetSettingsToDefaultsUseCase } from './application/use-cases/reset-settings-to-defaults.usecase'

const getAllSettingsUseCase =
  new GetAllSettingsUseCase(mongoSettingsRepository)

const getAppearanceSettingsUseCase =
  new GetAppearanceSettingsUseCase(mongoSettingsRepository)

const getNotificationSettingsUseCase =
  new GetNotificationSettingsUseCase(mongoSettingsRepository)

const getPrivacySettingsUseCase =
  new GetPrivacySettingsUseCase(mongoSettingsRepository)

const getGestureSettingsUseCase =
  new GetGestureSettingsUseCase(mongoSettingsRepository)

const updateAccountSettingsUseCase =
  new UpdateAccountSettingsUseCase(mongoSettingsRepository)

const updateAppearanceUseCase =
  new UpdateAppearanceUseCase(mongoSettingsRepository)

const updateNotificationsUseCase =
  new UpdateNotificationsUseCase(mongoSettingsRepository)

const updateQuietHoursUseCase =
  new UpdateQuietHoursUseCase(mongoSettingsRepository)

const updateEmailDigestUseCase =
  new UpdateEmailDigestUseCase(mongoSettingsRepository)

const updatePrivacyUseCase =
  new UpdatePrivacyUseCase(mongoSettingsRepository)

const updateCodeEditorUseCase =
  new UpdateCodeEditorUseCase(mongoSettingsRepository)

const updateCompilerUseCase =
  new UpdateCompilerUseCase(mongoSettingsRepository)

const updateAIBehaviourUseCase =
  new UpdateAIBehaviourUseCase(mongoSettingsRepository)

const updateLearningJourneyUseCase =
  new UpdateLearningJourneyUseCase(mongoSettingsRepository)

const updateGesturesUseCase =
  new UpdateGesturesUseCase(mongoSettingsRepository)

const updateCookieConsentUseCase =
  new UpdateCookieConsentUseCase(mongoSettingsRepository)

const acceptTermsUseCase =
  new AcceptTermsUseCase(mongoSettingsRepository)

const resetSettingsToDefaultsUseCase =
  new ResetSettingsToDefaultsUseCase(mongoSettingsRepository)

export const settingsService = {
  getAllSettings: async (userId: string) => {
    return getAllSettingsUseCase.execute(userId)
  },

  getAppearanceSettings: async (userId: string) => {
    return getAppearanceSettingsUseCase.execute(userId)
  },

  getNotificationSettings: async (userId: string) => {
    return getNotificationSettingsUseCase.execute(userId)
  },

  getPrivacySettings: async (userId: string) => {
    return getPrivacySettingsUseCase.execute(userId)
  },

  getGestureSettings: async (userId: string) => {
    return getGestureSettingsUseCase.execute(userId)
  },

  updateAccountSettings: async (
    userId: string,
    payload: UpdateAccountPayload
  ) => {
    return updateAccountSettingsUseCase.execute(userId, payload)
  },

  updateAppearance: async (
    userId: string,
    payload: UpdateAppearancePayload
  ) => {
    return updateAppearanceUseCase.execute(userId, payload)
  },

  updateNotifications: async (
    userId: string,
    payload: UpdateNotificationsPayload
  ) => {
    return updateNotificationsUseCase.execute(userId, payload)
  },

  updateQuietHours: async (
    userId: string,
    payload: UpdateQuietHoursPayload
  ) => {
    return updateQuietHoursUseCase.execute(userId, payload)
  },

  updateEmailDigest: async (
    userId: string,
    payload: UpdateEmailDigestPayload
  ) => {
    return updateEmailDigestUseCase.execute(userId, payload)
  },

  updatePrivacy: async (
    userId: string,
    payload: UpdatePrivacyPayload
  ) => {
    return updatePrivacyUseCase.execute(userId, payload)
  },

  updateCodeEditor: async (
    userId: string,
    payload: UpdateCodeEditorPayload
  ) => {
    return updateCodeEditorUseCase.execute(userId, payload)
  },

  updateCompiler: async (
    userId: string,
    payload: UpdateCompilerPayload
  ) => {
    return updateCompilerUseCase.execute(userId, payload)
  },

  updateAIBehaviour: async (
    userId: string,
    payload: UpdateAIBehaviourPayload
  ) => {
    return updateAIBehaviourUseCase.execute(userId, payload)
  },

  updateLearningJourney: async (
    userId: string,
    payload: UpdateLearningJourneyPayload
  ) => {
    return updateLearningJourneyUseCase.execute(userId, payload)
  },

  updateGestures: async (
    userId: string,
    payload: UpdateGesturesPayload
  ) => {
    return updateGesturesUseCase.execute(userId, payload)
  },

  updateCookieConsent: async (
    userId: string,
    cookieConsent: boolean
  ) => {
    return updateCookieConsentUseCase.execute(userId, cookieConsent)
  },

  acceptTerms: async (userId: string) => {
    return acceptTermsUseCase.execute(userId)
  },

  resetToDefaults: async (userId: string) => {
    return resetSettingsToDefaultsUseCase.execute(userId)
  },
}
