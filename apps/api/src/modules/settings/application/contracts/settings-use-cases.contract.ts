import type * as Application from '../index'
export type SettingsUseCases = {
  getAllSettings: Application.IGetAllSettingsUseCase
  getAppearanceSettings: Application.IGetAppearanceSettingsUseCase
  getNotificationSettings: Application.IGetNotificationSettingsUseCase
  getPrivacySettings: Application.IGetPrivacySettingsUseCase
  getGestureSettings: Application.IGetGestureSettingsUseCase
  updateAccountSettings: Application.IUpdateAccountSettingsUseCase
  updateAppearance: Application.IUpdateAppearanceUseCase
  updateNotifications: Application.IUpdateNotificationsUseCase
  updateQuietHours: Application.IUpdateQuietHoursUseCase
  updateEmailDigest: Application.IUpdateEmailDigestUseCase
  updatePrivacy: Application.IUpdatePrivacyUseCase
  updateCodeEditor: Application.IUpdateCodeEditorUseCase
  updateCompiler: Application.IUpdateCompilerUseCase
  updateAIBehaviour: Application.IUpdateAIBehaviourUseCase
  updateLearningJourney: Application.IUpdateLearningJourneyUseCase
  updateGestures: Application.IUpdateGesturesUseCase
  updateCookieConsent: Application.IUpdateCookieConsentUseCase
  acceptTerms: Application.IAcceptTermsUseCase
  resetSettingsToDefaults: Application.IResetSettingsToDefaultsUseCase
}
