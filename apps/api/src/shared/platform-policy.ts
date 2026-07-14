/**
 * Product rules that administrators may change without deploying the API.
 *
 * This contract deliberately contains no database or environment concerns. Application
 * modules depend on the narrow readers below and infrastructure supplies their values.
 */
export type ActivityPolicy = {
  weeklyXpTarget: number;
  dailyGoalRewardXp: number;
};

export type CommunityPolicy = {
  verificationRequiredVotes: number;
  verificationDurationHours: number;
  voteTeacherXp: number;
  majorityTeacherXp: number;
  reviewRewardCoins: number;
};

export type LeaderboardPolicy = {
  targetRank: number;
  weeklyTierXp: number;
  studentRewardCoins: number;
  trainerRewardCoins: number;
  studentBadgeName: string;
  trainerBadgeName: string;
};

export type MockTestPolicy = {
  maxManualQuestions: number;
  defaultTimeLimitMinutes: number;
  defaultPassingScore: number;
  completionXp: number;
};

export type TrackerPolicy = {
  subtopicCompletionXp: number;
  topicCompletionXp: number;
  trackerCompletionXp: number;
};

export type SecurityProductPolicy = {
  accountDeletionRecoveryDays: number;
};

export type PlatformPolicy = {
  activity: ActivityPolicy;
  community: CommunityPolicy;
  leaderboard: LeaderboardPolicy;
  mockTests: MockTestPolicy;
  trackers: TrackerPolicy;
  security: SecurityProductPolicy;
};

/** Safe product defaults used for a new installation and as legacy-data fallbacks. */
export const PLATFORM_POLICY_DEFAULTS: Readonly<PlatformPolicy> = {
  activity: {
    weeklyXpTarget: 5_000,
    dailyGoalRewardXp: 50,
  },
  community: {
    verificationRequiredVotes: 10,
    verificationDurationHours: 24,
    voteTeacherXp: 30,
    majorityTeacherXp: 100,
    reviewRewardCoins: 50,
  },
  leaderboard: {
    targetRank: 100,
    weeklyTierXp: 5_000,
    studentRewardCoins: 500,
    trainerRewardCoins: 500,
    studentBadgeName: 'Centurion Scholar',
    trainerBadgeName: 'Centurion Mentor',
  },
  mockTests: {
    maxManualQuestions: 100,
    defaultTimeLimitMinutes: 30,
    defaultPassingScore: 60,
    completionXp: 50,
  },
  trackers: {
    subtopicCompletionXp: 30,
    topicCompletionXp: 50,
    trackerCompletionXp: 0,
  },
  security: {
    accountDeletionRecoveryDays: 30,
  },
};

export const resolvePlatformPolicy = (value?: Partial<PlatformPolicy>): PlatformPolicy => ({
  activity: { ...PLATFORM_POLICY_DEFAULTS.activity, ...value?.activity },
  community: { ...PLATFORM_POLICY_DEFAULTS.community, ...value?.community },
  leaderboard: { ...PLATFORM_POLICY_DEFAULTS.leaderboard, ...value?.leaderboard },
  mockTests: { ...PLATFORM_POLICY_DEFAULTS.mockTests, ...value?.mockTests },
  trackers: { ...PLATFORM_POLICY_DEFAULTS.trackers, ...value?.trackers },
  security: { ...PLATFORM_POLICY_DEFAULTS.security, ...value?.security },
});

export interface IActivityPolicyReader {
  getActivityPolicy(): Promise<ActivityPolicy>;
}

export interface ICommunityPolicyReader {
  getCommunityPolicy(): Promise<CommunityPolicy>;
}

export interface ILeaderboardPolicyReader {
  getLeaderboardPolicy(): Promise<LeaderboardPolicy>;
}

export interface IMockTestPolicyReader {
  getMockTestPolicy(): Promise<MockTestPolicy>;
}

export interface ITrackerPolicyReader {
  getTrackerPolicy(): Promise<TrackerPolicy>;
}

export interface ISecurityProductPolicyReader {
  getSecurityProductPolicy(): Promise<SecurityProductPolicy>;
}
