import type {
  UserSettingsView,
} from '../types/settings.types'

export interface SettingsRepository {
  findByUserId(userId: string): Promise<UserSettingsView | null>
  findOrCreate(userId: string): Promise<UserSettingsView>

  updateAppearance(
    userId: string,
    data: object
  ): Promise<UserSettingsView | null>

  updateNotifications(
    userId: string,
    data: object
  ): Promise<UserSettingsView | null>

  updateNotificationTypes(
    userId: string,
    types: Record<string, boolean>
  ): Promise<UserSettingsView | null>

  updatePrivacy(
    userId: string,
    data: object
  ): Promise<UserSettingsView | null>

  updateCodeEditor(
    userId: string,
    data: object
  ): Promise<UserSettingsView | null>

  updateCompiler(
    userId: string,
    data: object
  ): Promise<UserSettingsView | null>

  updateAIBehaviour(
    userId: string,
    data: object
  ): Promise<UserSettingsView | null>

  updateLearningJourney(
    userId: string,
    data: object
  ): Promise<UserSettingsView | null>

  updateGestures(
    userId: string,
    data: object
  ): Promise<UserSettingsView | null>

  updateQuietHours(
    userId: string,
    data: object
  ): Promise<UserSettingsView | null>

  updateEmailDigest(
    userId: string,
    data: object
  ): Promise<UserSettingsView | null>

  updateAccountSettings(
    userId: string,
    data: object
  ): Promise<UserSettingsView | null>

  updateCookieConsent(
    userId: string,
    cookieConsent: boolean
  ): Promise<UserSettingsView | null>

  acceptTerms(userId: string): Promise<UserSettingsView | null>
  resetToDefaults(userId: string): Promise<UserSettingsView>
}
