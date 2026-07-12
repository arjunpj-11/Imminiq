export type AIResponseStyleType = 'concise' | 'detailed' | 'eli5'
export type DigestFrequencyType = 'daily' | 'weekly' | 'never'
export type MessagePermissionType = 'everyone' | 'friends' | 'nobody'
export type ProfileVisibilityType = 'public' | 'friends' | 'private'
export type QuietHoursDayType =
  | 'Mon'
  | 'Tue'
  | 'Wed'
  | 'Thu'
  | 'Fri'
  | 'Sat'
  | 'Sun'
export type ThemeType = 'light' | 'dark' | 'system'
export type NotificationTypeSettings = {
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

export type AppearanceSettingsData = { theme?: ThemeType }

export type EmailDigestSettingsData = {
  enabled?: boolean
  frequency?: DigestFrequencyType
  includeActivity?: boolean
  includeRecommendations?: boolean
}

export type NotificationSettingsData = {
  globalEnabled?: boolean
  globalEmail?: boolean
  globalPush?: boolean
  marketing?: boolean
  weeklyReport?: boolean
  quietHoursEnabled?: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
  quietHoursDays?: QuietHoursDayType[]
  emailDigest?: EmailDigestSettingsData
  types?: Partial<NotificationTypeSettings>
}

export type PrivacySettingsData = {
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

export type CodeEditorSettingsData = {
  theme?: string
  fontSize?: number
  tabSize?: number
  autoIndent?: boolean
  lineNumbers?: boolean
  wordWrap?: boolean
  minimap?: boolean
}

export type CompilerSettingsData = {
  defaultLanguage?: string
  defaultRuntime?: string
  autoSwitchLanguage?: boolean
}

export type AIBehaviourSettingsData = {
  responseStyle?: AIResponseStyleType
  autoGenerateLessons?: boolean
  showAIInsights?: boolean
  dailyQuotaAlert?: boolean
}

export type LearningJourneySettingsData = {
  dailyGoalMinutes?: number
  reminderEnabled?: boolean
  reminderTime?: string
  autoPlayNextTopic?: boolean
  showEstimatedTime?: boolean
}

export type GestureSettingsData = {
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

export type AccountSettingsData = {
  language?: string
  timezone?: string
  dateFormat?: string
}

export type UserSettingsData = {
  _id?: unknown
  id?: string
  userId?: string
  appearance?: AppearanceSettingsData
  notifications?: NotificationSettingsData
  privacy?: PrivacySettingsData
  codeEditor?: CodeEditorSettingsData
  compiler?: CompilerSettingsData
  aiBehaviour?: AIBehaviourSettingsData
  learningJourney?: LearningJourneySettingsData
  gestures?: GestureSettingsData
  account?: AccountSettingsData
  cookieConsent?: boolean
  termsAccepted?: boolean
  termsAcceptedAt?: Date | string
  createdAt?: Date | string
  updatedAt?: Date | string
  [key: string]: unknown
}
export type { UserSettingsEntity as UserSettingsRecord } from './entities/user-settings.entity'
