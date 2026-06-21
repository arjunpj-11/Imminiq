import {
  SettingsMapper,
  type SettingsMapperContract,
} from './application/mappers/settings.mapper'
import { AcceptTermsUseCase } from './application/use-cases/accept-terms.usecase'
import { GetAllSettingsUseCase } from './application/use-cases/get-all-settings.usecase'
import { GetAppearanceSettingsUseCase } from './application/use-cases/get-appearance-settings.usecase'
import { GetGestureSettingsUseCase } from './application/use-cases/get-gesture-settings.usecase'
import { GetNotificationSettingsUseCase } from './application/use-cases/get-notification-settings.usecase'
import { GetPrivacySettingsUseCase } from './application/use-cases/get-privacy-settings.usecase'
import { ResetSettingsToDefaultsUseCase } from './application/use-cases/reset-settings-to-defaults.usecase'
import { UpdateAccountSettingsUseCase } from './application/use-cases/update-account-settings.usecase'
import { UpdateAIBehaviourUseCase } from './application/use-cases/update-ai-behaviour.usecase'
import { UpdateAppearanceUseCase } from './application/use-cases/update-appearance.usecase'
import { UpdateCodeEditorUseCase } from './application/use-cases/update-code-editor.usecase'
import { UpdateCompilerUseCase } from './application/use-cases/update-compiler.usecase'
import { UpdateCookieConsentUseCase } from './application/use-cases/update-cookie-consent.usecase'
import { UpdateEmailDigestUseCase } from './application/use-cases/update-email-digest.usecase'
import { UpdateGesturesUseCase } from './application/use-cases/update-gestures.usecase'
import { UpdateLearningJourneyUseCase } from './application/use-cases/update-learning-journey.usecase'
import { UpdateNotificationsUseCase } from './application/use-cases/update-notifications.usecase'
import { UpdatePrivacyUseCase } from './application/use-cases/update-privacy.usecase'
import { UpdateQuietHoursUseCase } from './application/use-cases/update-quiet-hours.usecase'
import { mongoSettingsRepository } from './infrastructure/repositories/mongo-settings.repository'

export type SettingsUseCases = {
  getAllSettings: GetAllSettingsUseCase
  getAppearanceSettings: GetAppearanceSettingsUseCase
  getNotificationSettings: GetNotificationSettingsUseCase
  getPrivacySettings: GetPrivacySettingsUseCase
  getGestureSettings: GetGestureSettingsUseCase
  updateAccountSettings: UpdateAccountSettingsUseCase
  updateAppearance: UpdateAppearanceUseCase
  updateNotifications: UpdateNotificationsUseCase
  updateQuietHours: UpdateQuietHoursUseCase
  updateEmailDigest: UpdateEmailDigestUseCase
  updatePrivacy: UpdatePrivacyUseCase
  updateCodeEditor: UpdateCodeEditorUseCase
  updateCompiler: UpdateCompilerUseCase
  updateAIBehaviour: UpdateAIBehaviourUseCase
  updateLearningJourney: UpdateLearningJourneyUseCase
  updateGestures: UpdateGesturesUseCase
  updateCookieConsent: UpdateCookieConsentUseCase
  acceptTerms: AcceptTermsUseCase
  resetSettingsToDefaults: ResetSettingsToDefaultsUseCase
}

export type SettingsServiceHelpers = {
  settingsMapper: SettingsMapperContract
}

export type SettingsComposition = {
  useCases: SettingsUseCases
  helpers: SettingsServiceHelpers
}

export const createSettingsComposition = (): SettingsComposition => {
  const settingsRepository = mongoSettingsRepository
  const settingsMapper = new SettingsMapper()

  return {
    useCases: {
      getAllSettings: new GetAllSettingsUseCase(
        settingsRepository,
        settingsMapper
      ),

      getAppearanceSettings: new GetAppearanceSettingsUseCase(
        settingsRepository,
        settingsMapper
      ),

      getNotificationSettings: new GetNotificationSettingsUseCase(
        settingsRepository,
        settingsMapper
      ),

      getPrivacySettings: new GetPrivacySettingsUseCase(
        settingsRepository,
        settingsMapper
      ),

      getGestureSettings: new GetGestureSettingsUseCase(
        settingsRepository,
        settingsMapper
      ),

      updateAccountSettings: new UpdateAccountSettingsUseCase(
        settingsRepository,
        settingsMapper
      ),

      updateAppearance: new UpdateAppearanceUseCase(
        settingsRepository,
        settingsMapper
      ),

      updateNotifications: new UpdateNotificationsUseCase(
        settingsRepository,
        settingsMapper
      ),

      updateQuietHours: new UpdateQuietHoursUseCase(
        settingsRepository,
        settingsMapper
      ),

      updateEmailDigest: new UpdateEmailDigestUseCase(
        settingsRepository,
        settingsMapper
      ),

      updatePrivacy: new UpdatePrivacyUseCase(
        settingsRepository,
        settingsMapper
      ),

      updateCodeEditor: new UpdateCodeEditorUseCase(
        settingsRepository,
        settingsMapper
      ),

      updateCompiler: new UpdateCompilerUseCase(
        settingsRepository,
        settingsMapper
      ),

      updateAIBehaviour: new UpdateAIBehaviourUseCase(
        settingsRepository,
        settingsMapper
      ),

      updateLearningJourney: new UpdateLearningJourneyUseCase(
        settingsRepository,
        settingsMapper
      ),

      updateGestures: new UpdateGesturesUseCase(
        settingsRepository,
        settingsMapper
      ),

      updateCookieConsent: new UpdateCookieConsentUseCase(
        settingsRepository,
        settingsMapper
      ),

      acceptTerms: new AcceptTermsUseCase(
        settingsRepository,
        settingsMapper
      ),

      resetSettingsToDefaults: new ResetSettingsToDefaultsUseCase(
        settingsRepository,
        settingsMapper
      ),
    },

    helpers: {
      settingsMapper,
    },
  }
}