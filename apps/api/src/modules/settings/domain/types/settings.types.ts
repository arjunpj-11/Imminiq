export type ThemeType = 'light' | 'dark' | 'system'
export type FontSizeType = 'small' | 'medium' | 'large'
export type LayoutDensityType = 'comfortable' | 'compact'
export type ProfileVisibilityType = 'public' | 'friends' | 'private'
export type MessagePermissionType = 'everyone' | 'friends' | 'nobody'
export type AIResponseStyleType = 'concise' | 'detailed' | 'eli5'
export type DigestFrequencyType = 'daily' | 'weekly' | 'never'

export type QuietHoursDayType =
  | 'Mon'
  | 'Tue'
  | 'Wed'
  | 'Thu'
  | 'Fri'
  | 'Sat'
  | 'Sun'

export interface NotificationTypeSettings {
  friendRequests: boolean
  challenges: boolean
  battleResults: boolean
  testCompletion: boolean
  postLiked: boolean
  postCommented: boolean
  trackerCloned: boolean
  streakMilestones: boolean
  studyReminders: boolean
  adminBroadcasts: boolean
  accountAlerts: boolean
  subscriptionWarnings: boolean
  paymentConfirmations: boolean
  contributionUpdates: boolean
  callMissed: boolean
}

export interface UpdateAppearancePayload {
  theme?: ThemeType
  accentColor?: string
  fontSize?: FontSizeType
  layoutDensity?: LayoutDensityType
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

export type FlatUpdate = Record<string, unknown>

export interface UserSettingsView {
  appearance?: unknown
  notifications?: unknown
  privacy?: unknown
  gestures?: unknown
  [key: string]: unknown
}
