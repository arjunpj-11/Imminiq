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

export interface IAppearanceSettings {
  theme: ThemeType
}

export interface INotificationTypeSettings {
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

export interface IEmailDigestSettings {
  enabled: boolean
  frequency: DigestFrequencyType
  includeActivity: boolean
  includeRecommendations: boolean
}

export interface INotificationSettings {
  globalEnabled: boolean
  globalEmail: boolean
  globalPush: boolean
  marketing: boolean
  weeklyReport: boolean
  types: INotificationTypeSettings
  emailDigest: IEmailDigestSettings
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
  quietHoursDays?: QuietHoursDayType[]
}

export interface IPrivacySettings {
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

export interface ICodeEditorSettings {
  theme: string
  fontSize: number
  tabSize: number
  autoIndent: boolean
  lineNumbers: boolean
  wordWrap: boolean
  minimap: boolean
}

export interface ICompilerSettings {
  defaultLanguage: string
  defaultRuntime: string
  autoSwitchLanguage: boolean
}

export interface IAIBehaviourSettings {
  responseStyle: AIResponseStyleType
  autoGenerateLessons: boolean
  showAIInsights: boolean
  dailyQuotaAlert: boolean
}

export interface ILearningJourneySettings {
  dailyGoalMinutes: number
  reminderEnabled: boolean
  reminderTime: string
  autoPlayNextTopic: boolean
  showEstimatedTime: boolean
}

export interface IGestureSettings {
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

export interface IAccountSettings {
  language: string
  timezone: string
  dateFormat: string
}

export interface IUserSettings {
  _id: string
  userId: string

  account: IAccountSettings
  appearance: IAppearanceSettings
  notifications: INotificationSettings
  privacy: IPrivacySettings
  codeEditor: ICodeEditorSettings
  compiler: ICompilerSettings
  aiBehaviour: IAIBehaviourSettings
  learningJourney: ILearningJourneySettings
  gestures: IGestureSettings

  cookieConsent: boolean
  termsAccepted: boolean
  termsAcceptedAt: string | null

  createdAt: string
  updatedAt: string
}

export interface IApiEnvelope<T> {
  success?: boolean
  message: string
  data: T
}

export interface IUpdateAppearancePayload {
  theme?: ThemeType
}

export interface IUpdateNotificationsPayload {
  globalEnabled?: boolean
  globalEmail?: boolean
  globalPush?: boolean
  marketing?: boolean
  weeklyReport?: boolean
  types?: INotificationTypeSettings
}

export interface IUpdateQuietHoursPayload {
  quietHoursEnabled: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
  quietHoursDays?: QuietHoursDayType[]
}

export interface IUpdateEmailDigestPayload {
  enabled?: boolean
  frequency?: DigestFrequencyType
  includeActivity?: boolean
  includeRecommendations?: boolean
}

export interface IUpdatePrivacyPayload {
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

export interface IUpdateCodeEditorPayload {
  theme?: string
  fontSize?: number
  tabSize?: number
  autoIndent?: boolean
  lineNumbers?: boolean
  wordWrap?: boolean
  minimap?: boolean
}

export interface IUpdateCompilerPayload {
  defaultLanguage?: string
  defaultRuntime?: string
  autoSwitchLanguage?: boolean
}

export interface IUpdateAIBehaviourPayload {
  responseStyle?: AIResponseStyleType
  autoGenerateLessons?: boolean
  showAIInsights?: boolean
  dailyQuotaAlert?: boolean
}

export interface IUpdateLearningJourneyPayload {
  dailyGoalMinutes?: number
  reminderEnabled?: boolean
  reminderTime?: string
  autoPlayNextTopic?: boolean
  showEstimatedTime?: boolean
}

export interface IUpdateGesturesPayload {
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

export interface IUpdateAccountSettingsPayload {
  language?: string
  timezone?: string
  dateFormat?: string
}

/* ─── Account Security ─── */

export interface ISecuritySession {
  id: string
  deviceName: string
  location: string
  client: string
  lastActive: string
  current?: boolean
}

export interface ISecurityOverview {
  email: string
  emailVerified: boolean
  pendingEmail: string | null

  authProvider: 'local' | 'google' | 'github'
  canChangePassword: boolean

  twoFactorEnabled: boolean
  activeSessions: ISecuritySession[]
  passwordLastChangedAt: string | null
}

export interface ISensitiveActionStepUpPayload {
  currentPassword?: string
  twoFactorCode?: string
}

export interface IChangeEmailPayload extends ISensitiveActionStepUpPayload {
  newEmail: string
}

export interface IChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface IDeleteAccountPayload extends ISensitiveActionStepUpPayload {
  confirmation: 'DELETE'
}

 export interface IDeleteAccountResponse {
  deleted: true
  deletionScheduled: true
  scheduledDeletionAt: string
  recoveryWindowDays: number
}

export interface ITwoFactorSetupResponse {
  qrCodeDataUrl: string
  manualEntryKey: string
  issuer: string
  accountLabel: string
}

export interface IVerifyTwoFactorSetupPayload {
  token: string
}

export interface IVerifyTwoFactorSetupResponse {
  enabled: boolean
  backupCodes: string[]
}

export interface IDisableTwoFactorPayload {
  token: string
}

export interface IDisableTwoFactorResponse {
  disabled: boolean
}