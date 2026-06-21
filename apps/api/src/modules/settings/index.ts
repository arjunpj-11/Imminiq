export { settingsService } from './settings.service'
export type { SettingsService } from './settings.service'

export type {
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
} from './application/dtos/settings.dto'

export type {
  AIResponseStyleType,
  DigestFrequencyType,
  MessagePermissionType,
  ProfileVisibilityType,
  QuietHoursDayType,
  ThemeType,
} from './domain/types/settings.types'
