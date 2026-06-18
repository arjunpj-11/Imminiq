import type { UserSettingsEntity } from '../entities/user-settings.entity'
import type { AIResponseStyleType } from '../value-objects/ai-response-style-type.vo'
import type { DigestFrequencyType } from '../value-objects/digest-frequency-type.vo'
import type { MessagePermissionType } from '../value-objects/message-permission-type.vo'
import type { ProfileVisibilityType } from '../value-objects/profile-visibility-type.vo'
import type { QuietHoursDayType } from '../value-objects/quiet-hours-day-type.vo'
import type { ThemeType } from '../value-objects/theme-type.vo'
import type { NotificationTypeSettings } from '../value-objects/user-settings-data.vo'

export interface SettingsAppearanceUpdateInput {
  theme?: ThemeType
}

export interface SettingsNotificationsUpdateInput {
  globalEnabled?: boolean
  globalEmail?: boolean
  globalPush?: boolean
  marketing?: boolean
  weeklyReport?: boolean
  types?: Partial<NotificationTypeSettings>
}

export interface SettingsPrivacyUpdateInput {
  profileVisibility?: ProfileVisibilityType
  showProfile?: boolean
  showStreak?: boolean
  showProgress?: boolean
  showLeaderboardRank?: boolean
  showActivity?: boolean
  showOnlineStatus?: boolean
  showStats?: boolean
  allowFriendRequests?: boolean
  allowChallenges?: boolean
  allowMessages?: boolean
  messagePermission?: MessagePermissionType
  allowPublicTrackerView?: boolean
  allowTrackerCloning?: boolean
  showTrackerProgress?: boolean
}

export interface SettingsCodeEditorUpdateInput {
  theme?: string
  fontSize?: number
  tabSize?: number
  autoIndent?: boolean
  lineNumbers?: boolean
  wordWrap?: boolean
  minimap?: boolean
}

export interface SettingsCompilerUpdateInput {
  defaultLanguage?: string
  defaultRuntime?: string
  autoSwitchLanguage?: boolean
}

export interface SettingsAIBehaviourUpdateInput {
  responseStyle?: AIResponseStyleType
  autoGenerateLessons?: boolean
  showAIInsights?: boolean
  dailyQuotaAlert?: boolean
}

export interface SettingsLearningJourneyUpdateInput {
  dailyGoalMinutes?: number
  reminderEnabled?: boolean
  reminderTime?: string
  autoPlayNextTopic?: boolean
  showEstimatedTime?: boolean
}

export interface SettingsGesturesUpdateInput {
  enabled?: boolean
  sensitivity?: number
  swipeToNext?: boolean
  swipeToPrevious?: boolean
  pinchToZoom?: boolean
  backGesture?: boolean
  zoomGesture?: boolean
  annotateGesture?: boolean
  scrollGesture?: boolean
}

export interface SettingsQuietHoursUpdateInput {
  quietHoursEnabled: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
  quietHoursDays?: QuietHoursDayType[]
}

export interface SettingsEmailDigestUpdateInput {
  enabled?: boolean
  frequency?: DigestFrequencyType
  includeActivity?: boolean
  includeRecommendations?: boolean
}

export interface SettingsAccountUpdateInput {
  language?: string
  timezone?: string
  dateFormat?: string
}

export interface SettingsCommandRepositoryContract {
  updateAppearance(
    userId: string,
    data: SettingsAppearanceUpdateInput,
  ): Promise<UserSettingsEntity | null>

  updateNotifications(
    userId: string,
    data: Omit<SettingsNotificationsUpdateInput, 'types'>,
  ): Promise<UserSettingsEntity | null>

  updateNotificationTypes(
    userId: string,
    types: Partial<NotificationTypeSettings>,
  ): Promise<UserSettingsEntity | null>

  updatePrivacy(
    userId: string,
    data: SettingsPrivacyUpdateInput,
  ): Promise<UserSettingsEntity | null>

  updateCodeEditor(
    userId: string,
    data: SettingsCodeEditorUpdateInput,
  ): Promise<UserSettingsEntity | null>

  updateCompiler(
    userId: string,
    data: SettingsCompilerUpdateInput,
  ): Promise<UserSettingsEntity | null>

  updateAIBehaviour(
    userId: string,
    data: SettingsAIBehaviourUpdateInput,
  ): Promise<UserSettingsEntity | null>

  updateLearningJourney(
    userId: string,
    data: SettingsLearningJourneyUpdateInput,
  ): Promise<UserSettingsEntity | null>

  updateGestures(
    userId: string,
    data: SettingsGesturesUpdateInput,
  ): Promise<UserSettingsEntity | null>

  updateQuietHours(
    userId: string,
    data: SettingsQuietHoursUpdateInput,
  ): Promise<UserSettingsEntity | null>

  updateEmailDigest(
    userId: string,
    data: SettingsEmailDigestUpdateInput,
  ): Promise<UserSettingsEntity | null>

  updateAccountSettings(
    userId: string,
    data: SettingsAccountUpdateInput,
  ): Promise<UserSettingsEntity | null>

  updateCookieConsent(
    userId: string,
    cookieConsent: boolean,
  ): Promise<UserSettingsEntity | null>

  acceptTerms(userId: string): Promise<UserSettingsEntity | null>
  resetToDefaults(userId: string): Promise<UserSettingsEntity>
}
