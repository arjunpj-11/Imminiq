export type AdminSettings = {
  allowBroadcasts: boolean;
  aiMonthlyTokenBudget: number;
  aiBudgetWarningPercent: number;
  productPolicy: {
    features: {
      trackers: boolean;
      trackerCreation: boolean;
      community: boolean;
      leaderboard: boolean;
      mockTests: boolean;
      adaptiveLearning: boolean;
      social: boolean;
      calls: boolean;
      subscriptions: boolean;
      supportTickets: boolean;
      activity: boolean;
      savedItems: boolean;
    };
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
