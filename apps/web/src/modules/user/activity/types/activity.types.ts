export type ActivityFeedFilter = 'all' | 'trackers' | 'mock_tests' | 'community';

export type ActivityCategory = 'tracker' | 'mock_test' | 'community' | 'streak' | 'xp_milestone';

export type ActivityType =
  | 'subtopic_completed'
  | 'topic_completed'
  | 'tracker_completed'
  | 'mock_test_generated'
  | 'mock_test_completed'
  | 'tracker_cloned'
  | 'tracker_verified'
  | 'community_review_completed'
  | 'streak_milestone'
  | 'xp_milestone'
  | 'daily_goal_completed';

export type ActivityXpBucket = 'learning' | 'teacher' | 'none';

export type ActivityHeatmapIntensity = 'none' | 'low' | 'medium' | 'high';

export type ActivityEventIcon = 'tracker' | 'test' | 'community' | 'fire' | 'star';

export type ActivityDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface IActivityDetails {
  scorePercentage?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  durationSeconds?: number;
  previousLevel?: number;
  currentLevel?: number;
  milestoneValue?: number;
  previousRank?: number;
  currentRank?: number;
  difficulty?: ActivityDifficulty;
}

export interface IActivityEventReferences {
  trackerId: string | null;
  topicId: string | null;
  subtopicId: string | null;
  mockTestId: string | null;
  attemptId: string | null;
  sourceUserId: string | null;
}

export interface IActivityEvent {
  id: string;
  category: ActivityCategory;
  type: ActivityType;
  icon: ActivityEventIcon;
  title: string;
  subtitle: string;
  xp: number;
  xpBucket: ActivityXpBucket;
  coins: number;
  occurredAt: string;
  date: string;
  details: IActivityDetails;
  references: IActivityEventReferences;
}

export interface IActivityFeedGroup {
  date: string;
  label: string;
  events: IActivityEvent[];
}

export interface IActivityFeedResponse {
  filter: ActivityFeedFilter;
  groups: IActivityFeedGroup[];
  pagination: {
    limit: number;
    returned: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export interface IActivityHeatmapItem {
  date: string;
  intensityLevel: ActivityHeatmapIntensity;
  activityCount: number;
  isFrozen: boolean;
}

export interface IActivityWeekDay {
  date: string;
  label: string;
  xp: number;
  sessions: number;
}

export interface IActivityPageResponse {
  generatedAt: string;

  user: {
    userId: string;
    fullName: string;
    avatarUrl?: string | null;
    isPremium: boolean;
    accountCreatedAt: string;
  };

  stats: {
    totalXp: number;
    learningXp: number;
    teacherXp: number;
    coins: number;
    sessions: number;
    subtopicsDone: number;
    testsAttempted: number;
    totalQuestions: number;
  };

  streak: {
    currentStreak: number;
    longestStreak: number;
    heatmap: IActivityHeatmapItem[];
  };

  weekly: {
    days: IActivityWeekDay[];
    currentXp: number;
    previousXp: number;
    growthPercent: number;
    targetXp: number;
    xpToTarget: number;
    progressPercent: number;
    breakdown: {
      trackerXp: number;
      testXp: number;
      communityXp: number;
      streakXp: number;
      milestoneXp: number;
    };
  };

  personalBests: {
    bestDayXp: number;
    longestStreak: number;
    bestWeekSessions: number;
    bestTestScore: number;
  };

  dailyGoal: {
    tasks: Array<{
      key: 'subtopic' | 'mock_test';
      label: string;
      completed: boolean;
    }>;
    completedTasks: number;
    totalTasks: number;
    rewardXp: number;
    completed: boolean;
    progressPercent: number;
  };

  feed: IActivityFeedResponse;
}

export interface IActivityApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface IActivityApiErrorResponse {
  success?: boolean;
  message?: string;
  code?: string;
}

export interface IActivityPageQueryInput {
  year: number;
  filter: ActivityFeedFilter;
  limit: number;
  utcOffsetMinutes: number;
}

export interface IActivityFeedQueryInput {
  filter: ActivityFeedFilter;
  limit: number;
  utcOffsetMinutes: number;
}
