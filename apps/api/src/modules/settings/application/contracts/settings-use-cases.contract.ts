import type * as Application from '../index'
export type SettingsUseCases = {
  getAllSettings: Application.GetAllSettingsUseCase
  getAppearanceSettings: Application.GetAppearanceSettingsUseCase
  getNotificationSettings: Application.GetNotificationSettingsUseCase
  getPrivacySettings: Application.GetPrivacySettingsUseCase
  getGestureSettings: Application.GetGestureSettingsUseCase
  updateAccountSettings: Application.UpdateAccountSettingsUseCase
  updateAppearance: Application.UpdateAppearanceUseCase
  updateNotifications: Application.UpdateNotificationsUseCase
  updateQuietHours: Application.UpdateQuietHoursUseCase
  updateEmailDigest: Application.UpdateEmailDigestUseCase
  updatePrivacy: Application.UpdatePrivacyUseCase
  updateCodeEditor: Application.UpdateCodeEditorUseCase
  updateCompiler: Application.UpdateCompilerUseCase
  updateAIBehaviour: Application.UpdateAIBehaviourUseCase
  updateLearningJourney: Application.UpdateLearningJourneyUseCase
  updateGestures: Application.UpdateGesturesUseCase
  updateCookieConsent: Application.UpdateCookieConsentUseCase
  acceptTerms: Application.AcceptTermsUseCase
  resetSettingsToDefaults: Application.ResetSettingsToDefaultsUseCase
}
