import { z } from 'zod'

const notificationTypeSchema = z.object({
  friendRequests: z.boolean().optional(),
  challenges: z.boolean().optional(),
  battleResults: z.boolean().optional(),
  testCompletion: z.boolean().optional(),
  postLiked: z.boolean().optional(),
  postCommented: z.boolean().optional(),
  trackerCloned: z.boolean().optional(),
  streakMilestones: z.boolean().optional(),
  studyReminders: z.boolean().optional(),
  adminBroadcasts: z.boolean().optional(),
  accountAlerts: z.boolean().optional(),
  subscriptionWarnings: z.boolean().optional(),
  paymentConfirmations: z.boolean().optional(),
  contributionUpdates: z.boolean().optional(),
  callMissed: z.boolean().optional(),
})

export const updateAppearanceSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
})

export const updateNotificationsSchema = z.object({
  globalEnabled: z.boolean().optional(),
  globalEmail: z.boolean().optional(),
  globalPush: z.boolean().optional(),
  marketing: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
  types: notificationTypeSchema.optional(),
})

export const updatePrivacySchema = z.object({
  profileVisibility: z.enum(['public', 'friends', 'private']).optional(),

  showProfile: z.boolean().optional(),
  showStreak: z.boolean().optional(),
  showProgress: z.boolean().optional(),
  showLeaderboardRank: z.boolean().optional(),
  showActivity: z.boolean().optional(),
  showOnlineStatus: z.boolean().optional(),
  showStats: z.boolean().optional(),

  allowFriendRequests: z.boolean().optional(),
  allowChallenges: z.boolean().optional(),
  allowMessages: z.boolean().optional(),
  messagePermission: z.enum(['everyone', 'friends', 'nobody']).optional(),

  allowPublicTrackerView: z.boolean().optional(),
  allowTrackerCloning: z.boolean().optional(),
  showTrackerProgress: z.boolean().optional(),
})

export const updateCodeEditorSchema = z.object({
  theme: z.string().optional(),
  fontSize: z.number().min(8).max(32).optional(),
  tabSize: z.number().min(2).max(8).optional(),
  autoIndent: z.boolean().optional(),
  lineNumbers: z.boolean().optional(),
  wordWrap: z.boolean().optional(),
  minimap: z.boolean().optional(),
})

export const updateCompilerSchema = z.object({
  defaultLanguage: z.string().min(1).optional(),
  defaultRuntime: z.string().min(1).optional(),
  autoSwitchLanguage: z.boolean().optional(),
})

export const updateAIBehaviourSchema = z.object({
  responseStyle: z.enum(['concise', 'detailed', 'eli5']).optional(),
  autoGenerateLessons: z.boolean().optional(),
  showAIInsights: z.boolean().optional(),
  dailyQuotaAlert: z.boolean().optional(),
})

export const updateLearningJourneySchema = z.object({
  dailyGoalMinutes: z.number().min(5).max(480).optional(),

  reminderEnabled: z.boolean().optional(),

  reminderTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Format must be HH:MM')
    .optional(),

  autoPlayNextTopic: z.boolean().optional(),
  showEstimatedTime: z.boolean().optional(),
})

export const updateGesturesSchema = z.object({
  enabled: z.boolean().optional(),
  sensitivity: z.number().min(0).max(100).optional(),
  swipeToNext: z.boolean().optional(),
  swipeToPrevious: z.boolean().optional(),
  pinchToZoom: z.boolean().optional(),
  backGesture: z.boolean().optional(),
  zoomGesture: z.boolean().optional(),
  annotateGesture: z.boolean().optional(),
  scrollGesture: z.boolean().optional(),
})

export const updateQuietHoursSchema = z.object({
  quietHoursEnabled: z.boolean(),

  quietHoursStart: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Format must be HH:MM')
    .optional(),

  quietHoursEnd: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Format must be HH:MM')
    .optional(),

  quietHoursDays: z
    .array(
      z.enum([
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
        'Sun',
      ])
    )
    .optional(),
})

export const updateEmailDigestSchema = z.object({
  enabled: z.boolean().optional(),
  frequency: z.enum(['daily', 'weekly', 'never']).optional(),
  includeActivity: z.boolean().optional(),
  includeRecommendations: z.boolean().optional(),
})

export const updateAccountSettingsSchema = z.object({
  language: z.string().optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
})

export const updateCookieConsentSchema = z.object({
  cookieConsent: z.boolean(),
})