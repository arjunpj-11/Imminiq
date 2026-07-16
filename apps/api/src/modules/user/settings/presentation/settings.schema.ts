import { z } from 'zod';

export const submitDataPrivacyRequestSchema = z.object({
  type: z.enum(['access', 'export', 'delete', 'correction']),
  details: z.string().trim().min(10).max(3000),
});

const optionalTrimmedStringSchema = (maxLength: number, maxMessage: string) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : undefined;
  }, z.string().max(maxLength, maxMessage).optional());

const timeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format must be HH:MM');

const quietHoursDaySchema = z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

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
});

export const updateAppearanceSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

export const updateNotificationsSchema = z.object({
  globalEnabled: z.boolean().optional(),
  globalEmail: z.boolean().optional(),
  globalPush: z.boolean().optional(),
  marketing: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
  types: notificationTypeSchema.optional(),
});

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
});

export const updateCodeEditorSchema = z.object({
  theme: optionalTrimmedStringSchema(80, 'Editor theme is too long'),
  fontSize: z.number().int().min(8).max(32).optional(),
  tabSize: z.number().int().min(2).max(8).optional(),
  autoIndent: z.boolean().optional(),
  lineNumbers: z.boolean().optional(),
  wordWrap: z.boolean().optional(),
  minimap: z.boolean().optional(),
});

export const updateCompilerSchema = z.object({
  defaultLanguage: optionalTrimmedStringSchema(40, 'Default language is too long'),
  defaultRuntime: optionalTrimmedStringSchema(80, 'Default runtime is too long'),
  autoSwitchLanguage: z.boolean().optional(),
});

export const updateAIBehaviourSchema = z.object({
  responseStyle: z.enum(['concise', 'detailed', 'eli5']).optional(),
  autoGenerateLessons: z.boolean().optional(),
  showAIInsights: z.boolean().optional(),
  dailyQuotaAlert: z.boolean().optional(),
});

export const updateLearningJourneySchema = z.object({
  dailyGoalMinutes: z.number().int().min(5).max(480).optional(),
  reminderEnabled: z.boolean().optional(),
  reminderTime: timeSchema.optional(),
  autoPlayNextTopic: z.boolean().optional(),
  showEstimatedTime: z.boolean().optional(),
});

export const updateGesturesSchema = z.object({
  enabled: z.boolean().optional(),
  sensitivity: z.number().int().min(0).max(100).optional(),
  swipeToNext: z.boolean().optional(),
  swipeToPrevious: z.boolean().optional(),
  pinchToZoom: z.boolean().optional(),
  backGesture: z.boolean().optional(),
  zoomGesture: z.boolean().optional(),
  annotateGesture: z.boolean().optional(),
  scrollGesture: z.boolean().optional(),
});

export const updateQuietHoursSchema = z.object({
  quietHoursEnabled: z.boolean(),
  quietHoursStart: timeSchema.optional(),
  quietHoursEnd: timeSchema.optional(),
  quietHoursDays: z.array(quietHoursDaySchema).max(7).optional(),
});

export const updateEmailDigestSchema = z.object({
  enabled: z.boolean().optional(),
  frequency: z.enum(['daily', 'weekly', 'never']).optional(),
  includeActivity: z.boolean().optional(),
  includeRecommendations: z.boolean().optional(),
});

export const updateAccountSettingsSchema = z.object({
  language: optionalTrimmedStringSchema(40, 'Language is too long'),
  timezone: optionalTrimmedStringSchema(80, 'Timezone is too long'),
  dateFormat: optionalTrimmedStringSchema(40, 'Date format is too long'),
});

export type UpdateAppearanceInput = z.infer<typeof updateAppearanceSchema>;

export type UpdateNotificationsInput = z.infer<typeof updateNotificationsSchema>;

export type UpdatePrivacyInput = z.infer<typeof updatePrivacySchema>;

export type UpdateCodeEditorInput = z.infer<typeof updateCodeEditorSchema>;

export type UpdateCompilerInput = z.infer<typeof updateCompilerSchema>;

export type UpdateAIBehaviourInput = z.infer<typeof updateAIBehaviourSchema>;

export type UpdateLearningJourneyInput = z.infer<typeof updateLearningJourneySchema>;

export type UpdateGesturesInput = z.infer<typeof updateGesturesSchema>;

export type UpdateQuietHoursInput = z.infer<typeof updateQuietHoursSchema>;

export type UpdateEmailDigestInput = z.infer<typeof updateEmailDigestSchema>;

export type UpdateAccountSettingsInput = z.infer<typeof updateAccountSettingsSchema>;
