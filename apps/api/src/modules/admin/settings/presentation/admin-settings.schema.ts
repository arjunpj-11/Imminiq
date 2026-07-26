import { z } from 'zod';
export const adminSettingsSchema = z.object({
  allowBroadcasts: z.boolean(),
  aiMonthlyTokenBudget: z.number().int().min(1).max(10_000_000_000),
  aiBudgetWarningPercent: z.number().int().min(1).max(100),
  productPolicy: z.object({
    features: z.object({
      trackers: z.boolean(),
      trackerCreation: z.boolean(),
      community: z.boolean(),
      leaderboard: z.boolean(),
      mockTests: z.boolean(),
      adaptiveLearning: z.boolean(),
      social: z.boolean(),
      calls: z.boolean(),
      subscriptions: z.boolean(),
      supportTickets: z.boolean(),
      activity: z.boolean(),
      savedItems: z.boolean(),
    }),
    activity: z.object({
      weeklyXpTarget: z.number().int().min(1).max(1_000_000),
      dailyGoalRewardXp: z.number().int().min(0).max(100_000),
    }),
    community: z.object({
      verificationRequiredVotes: z.number().int().min(1).max(50),
      verificationDurationHours: z.number().int().min(1).max(168),
      voteTeacherXp: z.number().int().min(0).max(100_000),
      majorityTeacherXp: z.number().int().min(0).max(100_000),
      reviewRewardCoins: z.number().int().min(0).max(100_000),
    }),
    leaderboard: z.object({
      targetRank: z.number().int().min(1).max(10_000),
      weeklyTierXp: z.number().int().min(1).max(1_000_000),
      studentRewardCoins: z.number().int().min(0).max(1_000_000),
      trainerRewardCoins: z.number().int().min(0).max(1_000_000),
      studentBadgeName: z.string().trim().min(1).max(80),
      trainerBadgeName: z.string().trim().min(1).max(80),
    }),
    mockTests: z.object({
      maxManualQuestions: z.number().int().min(1).max(500),
      defaultTimeLimitMinutes: z.number().int().min(1).max(480),
      defaultPassingScore: z.number().int().min(1).max(100),
      completionXp: z.number().int().min(0).max(100_000),
    }),
    trackers: z.object({
      subtopicCompletionXp: z.number().int().min(0).max(100_000),
      topicCompletionXp: z.number().int().min(0).max(100_000),
      trackerCompletionXp: z.number().int().min(0).max(100_000),
    }),
    security: z.object({
      accountDeletionRecoveryDays: z.number().int().min(1).max(365),
    }),
  }),
});
