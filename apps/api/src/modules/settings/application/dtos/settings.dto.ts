import type { AIResponseStyleType } from '../../domain/value-objects/ai-response-style-type.vo'
import type { DigestFrequencyType } from '../../domain/value-objects/digest-frequency-type.vo'
import type { MessagePermissionType } from '../../domain/value-objects/message-permission-type.vo'
import type { ProfileVisibilityType } from '../../domain/value-objects/profile-visibility-type.vo'
import type { QuietHoursDayType } from '../../domain/value-objects/quiet-hours-day-type.vo'
import type { ThemeType } from '../../domain/value-objects/theme-type.vo'
import type {
  NotificationTypeSettings,
  UserSettingsData,
} from '../../domain/value-objects/user-settings-data.vo'

export interface UpdateAppearancePayload {
  theme?: ThemeType
}

export interface UpdateNotificationsPayload {
  globalEnabled?: boolean
  globalEmail?: boolean
  globalPush?: boolean
  marketing?: boolean
  weeklyReport?: boolean
  types?: Partial<NotificationTypeSettings>
}

export interface UpdatePrivacyPayload {
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

export interface UpdateCodeEditorPayload {
  theme?: string
  fontSize?: number
  tabSize?: number
  autoIndent?: boolean
  lineNumbers?: boolean
  wordWrap?: boolean
  minimap?: boolean
}

export interface UpdateCompilerPayload {
  defaultLanguage?: string
  defaultRuntime?: string
  autoSwitchLanguage?: boolean
}

export interface UpdateAIBehaviourPayload {
  responseStyle?: AIResponseStyleType
  autoGenerateLessons?: boolean
  showAIInsights?: boolean
  dailyQuotaAlert?: boolean
}

export interface UpdateLearningJourneyPayload {
  dailyGoalMinutes?: number
  reminderEnabled?: boolean
  reminderTime?: string
  autoPlayNextTopic?: boolean
  showEstimatedTime?: boolean
}

export interface UpdateGesturesPayload {
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

export interface UpdateQuietHoursPayload {
  quietHoursEnabled: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
  quietHoursDays?: QuietHoursDayType[]
}

export interface UpdateEmailDigestPayload {
  enabled?: boolean
  frequency?: DigestFrequencyType
  includeActivity?: boolean
  includeRecommendations?: boolean
}

export interface UpdateAccountPayload {
  language?: string
  timezone?: string
  dateFormat?: string
}

export type UserSettingsView = UserSettingsData
