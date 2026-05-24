export type ThemeType = 'light' | 'dark' | 'system'
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

export interface AppearanceSettings {
  theme: ThemeType
}

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

export interface EmailDigestSettings {
  enabled: boolean
  frequency: DigestFrequencyType
  includeActivity: boolean
  includeRecommendations: boolean
}

export interface NotificationSettings {
  globalEnabled: boolean
  globalEmail: boolean
  globalPush: boolean
  marketing: boolean
  weeklyReport: boolean
  types: NotificationTypeSettings
  emailDigest: EmailDigestSettings
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
  quietHoursDays?: QuietHoursDayType[]
}

export interface PrivacySettings {
  profileVisibility: ProfileVisibilityType

  showProfile: boolean
  showStreak: boolean
  showProgress: boolean
  showLeaderboardRank: boolean
  showActivity: boolean
  showOnlineStatus: boolean
  showStats: boolean

  allowFriendRequests: boolean
  allowChallenges: boolean
  allowMessages: boolean
  messagePermission: MessagePermissionType

  allowPublicTrackerView: boolean
  allowTrackerCloning: boolean
  showTrackerProgress: boolean
}

export interface CodeEditorSettings {
  theme: string
  fontSize: number
  tabSize: number
  autoIndent: boolean
  lineNumbers: boolean
  wordWrap: boolean
  minimap: boolean
}

export interface CompilerSettings {
  defaultLanguage: string
  defaultRuntime: string
  autoSwitchLanguage: boolean
}

export interface AIBehaviourSettings {
  responseStyle: AIResponseStyleType
  autoGenerateLessons: boolean
  showAIInsights: boolean
  dailyQuotaAlert: boolean
}

export interface LearningJourneySettings {
  dailyGoalMinutes: number
  reminderEnabled: boolean
  reminderTime: string
  autoPlayNextTopic: boolean
  showEstimatedTime: boolean
}

export interface GestureSettings {
  enabled: boolean
  sensitivity: number
  swipeToNext: boolean
  swipeToPrevious: boolean
  pinchToZoom: boolean
  backGesture: boolean
  zoomGesture: boolean
  annotateGesture: boolean
  scrollGesture: boolean
}

export interface AccountSettings {
  language: string
  timezone: string
  dateFormat: string
}

export interface UserSettings {
  _id: string
  userId: string

  account: AccountSettings
  appearance: AppearanceSettings
  notifications: NotificationSettings
  privacy: PrivacySettings
  codeEditor: CodeEditorSettings
  compiler: CompilerSettings
  aiBehaviour: AIBehaviourSettings
  learningJourney: LearningJourneySettings
  gestures: GestureSettings

  cookieConsent: boolean
  termsAccepted: boolean
  termsAcceptedAt: string | null

  createdAt: string
  updatedAt: string
}

export interface ApiEnvelope<T> {
  success?: boolean
  message: string
  data: T
}

export interface UpdateAppearancePayload {
  theme?: ThemeType
}

export interface UpdateNotificationsPayload {
  globalEnabled?: boolean
  globalEmail?: boolean
  globalPush?: boolean
  marketing?: boolean
  weeklyReport?: boolean
  types?: NotificationTypeSettings
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

export interface UpdateAccountSettingsPayload {
  language?: string
  timezone?: string
  dateFormat?: string
}

/* ─── Account Security ─── */

export interface SecuritySession {
  id: string
  deviceName: string
  location: string
  client: string
  lastActive: string
  current?: boolean
}

export interface SecurityOverview {
  email: string
  emailVerified: boolean
  pendingEmail: string | null

  authProvider: 'local' | 'google' | 'github'
  canChangePassword: boolean

  twoFactorEnabled: boolean
  activeSessions: SecuritySession[]
  passwordLastChangedAt: string | null
}

export interface SensitiveActionStepUpPayload {
  currentPassword?: string
  twoFactorCode?: string
}

export interface ChangeEmailPayload extends SensitiveActionStepUpPayload {
  newEmail: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface DeleteAccountPayload extends SensitiveActionStepUpPayload {
  confirmation: 'DELETE'
}

 export interface DeleteAccountResponse {
  deleted: true
  deletionScheduled: true
  scheduledDeletionAt: string
  recoveryWindowDays: number
}

export interface TwoFactorSetupResponse {
  qrCodeDataUrl: string
  manualEntryKey: string
  issuer: string
  accountLabel: string
}

export interface VerifyTwoFactorSetupPayload {
  token: string
}

export interface VerifyTwoFactorSetupResponse {
  enabled: boolean
  backupCodes: string[]
}

export interface DisableTwoFactorPayload {
  token: string
}

export interface DisableTwoFactorResponse {
  disabled: boolean
}