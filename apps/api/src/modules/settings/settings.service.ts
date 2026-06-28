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
  private readonly _useCases: SettingsComposition['useCases']

  constructor(composition: SettingsComposition) {
    this._useCases = composition.useCases
  }

  getAllSettings(userId: string) {
    return this._useCases.getAllSettings.execute(userId)
  }

  getAppearanceSettings(userId: string) {
    return this._useCases.getAppearanceSettings.execute(userId)
  }

  getNotificationSettings(userId: string) {
    return this._useCases.getNotificationSettings.execute(userId)
  }

  getPrivacySettings(userId: string) {
    return this._useCases.getPrivacySettings.execute(userId)
  }

  getGestureSettings(userId: string) {
    return this._useCases.getGestureSettings.execute(userId)
  }

  updateAccountSettings(userId: string, payload: UpdateAccountPayload) {
    return this._useCases.updateAccountSettings.execute(userId, payload)
  }

  updateAppearance(userId: string, payload: UpdateAppearancePayload) {
    return this._useCases.updateAppearance.execute(userId, payload)
  }

  updateNotifications(userId: string, payload: UpdateNotificationsPayload) {
    return this._useCases.updateNotifications.execute(userId, payload)
  }

  updateQuietHours(userId: string, payload: UpdateQuietHoursPayload) {
    return this._useCases.updateQuietHours.execute(userId, payload)
  }

  updateEmailDigest(userId: string, payload: UpdateEmailDigestPayload) {
    return this._useCases.updateEmailDigest.execute(userId, payload)
  }

  updatePrivacy(userId: string, payload: UpdatePrivacyPayload) {
    return this._useCases.updatePrivacy.execute(userId, payload)
  }

  updateCodeEditor(userId: string, payload: UpdateCodeEditorPayload) {
    return this._useCases.updateCodeEditor.execute(userId, payload)
  }

  updateCompiler(userId: string, payload: UpdateCompilerPayload) {
    return this._useCases.updateCompiler.execute(userId, payload)
  }

  updateAIBehaviour(userId: string, payload: UpdateAIBehaviourPayload) {
    return this._useCases.updateAIBehaviour.execute(userId, payload)
  }

  updateLearningJourney(
    userId: string,
    payload: UpdateLearningJourneyPayload
  ) {
    return this._useCases.updateLearningJourney.execute(userId, payload)
  }

  updateGestures(userId: string, payload: UpdateGesturesPayload) {
    return this._useCases.updateGestures.execute(userId, payload)
  }

  updateCookieConsent(userId: string, cookieConsent: boolean) {
    return this._useCases.updateCookieConsent.execute(userId, cookieConsent)
  }

  acceptTerms(userId: string) {
    return this._useCases.acceptTerms.execute(userId)
  }

  resetToDefaults(userId: string) {
    return this._useCases.resetSettingsToDefaults.execute(userId)
  }
}

export const settingsService = new SettingsService(
  createSettingsComposition()
)