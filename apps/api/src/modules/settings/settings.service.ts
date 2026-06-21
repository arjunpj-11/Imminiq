import type {
  UpdateAccountPayload,
  UpdateAIBehaviourPayload,
  UpdateAppearancePayload,
  UpdateCodeEditorPayload,
  UpdateCompilerPayload,
  UpdateEmailDigestPayload,
  UpdateGesturesPayload,
  UpdateLearningJourneyPayload,
  UpdateNotificationsPayload,
  UpdatePrivacyPayload,
  UpdateQuietHoursPayload,
} from './application/dtos/settings.dto'
import {
  createSettingsComposition,
  type SettingsComposition,
} from './settings.factory'

export class SettingsService {
  private readonly useCases: SettingsComposition['useCases']

  constructor(composition: SettingsComposition) {
    this.useCases = composition.useCases
  }

  getAllSettings(userId: string) {
    return this.useCases.getAllSettings.execute(userId)
  }

  getAppearanceSettings(userId: string) {
    return this.useCases.getAppearanceSettings.execute(userId)
  }

  getNotificationSettings(userId: string) {
    return this.useCases.getNotificationSettings.execute(userId)
  }

  getPrivacySettings(userId: string) {
    return this.useCases.getPrivacySettings.execute(userId)
  }

  getGestureSettings(userId: string) {
    return this.useCases.getGestureSettings.execute(userId)
  }

  updateAccountSettings(userId: string, payload: UpdateAccountPayload) {
    return this.useCases.updateAccountSettings.execute(userId, payload)
  }

  updateAppearance(userId: string, payload: UpdateAppearancePayload) {
    return this.useCases.updateAppearance.execute(userId, payload)
  }

  updateNotifications(userId: string, payload: UpdateNotificationsPayload) {
    return this.useCases.updateNotifications.execute(userId, payload)
  }

  updateQuietHours(userId: string, payload: UpdateQuietHoursPayload) {
    return this.useCases.updateQuietHours.execute(userId, payload)
  }

  updateEmailDigest(userId: string, payload: UpdateEmailDigestPayload) {
    return this.useCases.updateEmailDigest.execute(userId, payload)
  }

  updatePrivacy(userId: string, payload: UpdatePrivacyPayload) {
    return this.useCases.updatePrivacy.execute(userId, payload)
  }

  updateCodeEditor(userId: string, payload: UpdateCodeEditorPayload) {
    return this.useCases.updateCodeEditor.execute(userId, payload)
  }

  updateCompiler(userId: string, payload: UpdateCompilerPayload) {
    return this.useCases.updateCompiler.execute(userId, payload)
  }

  updateAIBehaviour(userId: string, payload: UpdateAIBehaviourPayload) {
    return this.useCases.updateAIBehaviour.execute(userId, payload)
  }

  updateLearningJourney(
    userId: string,
    payload: UpdateLearningJourneyPayload
  ) {
    return this.useCases.updateLearningJourney.execute(userId, payload)
  }

  updateGestures(userId: string, payload: UpdateGesturesPayload) {
    return this.useCases.updateGestures.execute(userId, payload)
  }

  updateCookieConsent(userId: string, cookieConsent: boolean) {
    return this.useCases.updateCookieConsent.execute(userId, cookieConsent)
  }

  acceptTerms(userId: string) {
    return this.useCases.acceptTerms.execute(userId)
  }

  resetToDefaults(userId: string) {
    return this.useCases.resetSettingsToDefaults.execute(userId)
  }
}

export const settingsService = new SettingsService(
  createSettingsComposition()
)