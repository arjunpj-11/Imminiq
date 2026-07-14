export type AdminSettings = {
  allowBroadcasts: boolean;
  supportEmail: string;
  auditRetentionDays: number;
  productPolicy: {
    activity: {
      weeklyXpTarget: number;
      dailyGoalRewardXp: number;
    };
    community: {
      verificationRequiredVotes: number;
      verificationDurationHours: number;
      voteTeacherXp: number;
      majorityTeacherXp: number;
      reviewRewardCoins: number;
    };
    leaderboard: {
      targetRank: number;
      weeklyTierXp: number;
      studentRewardCoins: number;
      trainerRewardCoins: number;
      studentBadgeName: string;
      trainerBadgeName: string;
    };
    mockTests: {
      maxManualQuestions: number;
      defaultTimeLimitMinutes: number;
      defaultPassingScore: number;
      completionXp: number;
    };
    trackers: {
      subtopicCompletionXp: number;
      topicCompletionXp: number;
      trackerCompletionXp: number;
    };
    security: {
      accountDeletionRecoveryDays: number;
    };
  };
  updatedAt: string;
};
