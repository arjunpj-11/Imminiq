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
  UserSettingsView,
} from '../types/settings.types'

export interface SettingsRepository {
  findByUserId(userId: string): Promise<UserSettingsView | null>
  findOrCreate(userId: string): Promise<UserSettingsView>

  updateAppearance(
    userId: string,
    data: UpdateAppearancePayload
  ): Promise<UserSettingsView | null>

  updateNotifications(
    userId: string,
    data: Omit<UpdateNotificationsPayload, 'types'>
  ): Promise<UserSettingsView | null>

  updateNotificationTypes(
    userId: string,
    types: Record<string, boolean>
  ): Promise<UserSettingsView | null>

  updatePrivacy(
    userId: string,
    data: UpdatePrivacyPayload
  ): Promise<UserSettingsView | null>

  updateCodeEditor(
    userId: string,
    data: UpdateCodeEditorPayload
  ): Promise<UserSettingsView | null>

  updateCompiler(
    userId: string,
    data: UpdateCompilerPayload
  ): Promise<UserSettingsView | null>

  updateAIBehaviour(
    userId: string,
    data: UpdateAIBehaviourPayload
  ): Promise<UserSettingsView | null>

  updateLearningJourney(
    userId: string,
    data: UpdateLearningJourneyPayload
  ): Promise<UserSettingsView | null>

  updateGestures(
    userId: string,
    data: UpdateGesturesPayload
  ): Promise<UserSettingsView | null>

  updateQuietHours(
    userId: string,
    data: UpdateQuietHoursPayload
  ): Promise<UserSettingsView | null>

  updateEmailDigest(
    userId: string,
    data: UpdateEmailDigestPayload
  ): Promise<UserSettingsView | null>

  updateAccountSettings(
    userId: string,
    data: UpdateAccountPayload
  ): Promise<UserSettingsView | null>

  updateCookieConsent(
    userId: string,
    cookieConsent: boolean
  ): Promise<UserSettingsView | null>

  acceptTerms(userId: string): Promise<UserSettingsView | null>
  resetToDefaults(userId: string): Promise<UserSettingsView>
}
