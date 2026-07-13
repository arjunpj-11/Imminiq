export type CommunitySort = 'top-rated' | 'most-cloned' | 'newest';

export type VerificationVoteChoice = 'pass' | 'fail';

export interface IApiResponse<TData> {
  success: boolean;
  message: string;
  data?: TData | null;
  meta?: object;
}

export interface IApiErrorResponse {
  success?: boolean;
  message?: string;
  code?: string;
}

export interface ICommunityPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ICommunityTracker {
  _id: string;
  title: string;
  description: string;
  rating: number;
  clones: number;
  verified: boolean;
  inDashboard: boolean;
  topic: string;
}

export interface ICommunityStatCard {
  label: string;
  value: string;
  helper: string;
}

export interface ICommunityVerifyBanner {
  queueCount: number;
  rewardCoins: number;
  activeReviewersThisWeek: number;
}

export interface ICommunityBrowseData {
  trackers: ICommunityTracker[];
  pagination: ICommunityPagination;
  stats: ICommunityStatCard[];
  topics: string[];
  verifyBanner: ICommunityVerifyBanner;
}

export interface ICommunityTrackerListData {
  trackers: ICommunityTracker[];
  pagination: ICommunityPagination;
}

export interface ICommunityVerifyItem {
  _id: string;
  title: string;
  category: string;
  timeLeft: string;
  excerpt: string;
  progress: number;
  passVotes: number;
  failVotes: number;
  requiredVotes: number;
  votedPass: boolean;
  closed: boolean;
  urgent: boolean;
}

export interface ICommunityVerificationStats {
  awaiting: string;
  reviewed: string;
  totalEarned: string;
  coinBalance: string;
  queueCount: number;
  rewardCoins: number;
  activeReviewersThisWeek: number;
}

export interface ICommunityLeaderboardEntry {
  rank: number;
  name: string;
  earned: string;
  badge: string;
  isMe?: boolean;
}

export interface ICommunityVerificationQueueData {
  items: ICommunityVerifyItem[];
  pagination: ICommunityPagination;
}

export interface ICommunityVerificationDashboardData extends ICommunityVerificationQueueData {
  stats: ICommunityVerificationStats;
  leaderboard: ICommunityLeaderboardEntry[];
  howItWorks: string[];
}

export interface ICommunityVerificationSubmission extends ICommunityVerifyItem {
  trackerId: string;
  ownerId: string;
  userVote?: VerificationVoteChoice | null;
  consensusChoice?: VerificationVoteChoice | null;
  reviewTracker?: ICommunityVerificationReviewTracker | null;
}

export interface IVoteVerificationSubmissionPayload {
  submissionId: string;
  vote: VerificationVoteChoice;
  reason?: string | null;
}

export interface IVoteVerificationSubmissionData {
  vote: {
    _id: string;
    submissionId: string;
    choice: VerificationVoteChoice;
    rewardCoins: number;
  };
  submission: ICommunityVerificationSubmission;
  reward: {
    awarded: boolean;
    coins: number;
    balance: number;
  };
}

export interface ICommunityBrowseQuery {
  search?: string;
  topics?: string[];
  minRating?: number | null;
  verifiedOnly?: boolean;
  sort?: CommunitySort;
  page?: number;
  limit?: number;
}

export interface ICommunityReviewAuthor {
  _id: string;
  name: string;
  username?: string;
  initials: string;
  avatarUrl?: string | null;
  role: string;
}

export interface ICommunityPublicTrackerSubtopic {
  _id: string;
  topicId: string;
  parentSubtopicId?: string | null;
  title: string;
  description: string;
  order: number;
  depth: number;
  isLocked: boolean;
  estimatedMinutes: number;
}

export interface ICommunityPublicTrackerTopic {
  _id: string;
  title: string;
  description: string;
  order: number;
  status: string;
  estimatedHours: number;
  subtopics: ICommunityPublicTrackerSubtopic[];
}

export interface ICommunityRatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface ICommunityRatingSummary {
  average: number;
  count: number;
  distribution: ICommunityRatingDistribution;
}

export interface ICommunityTrackerReview {
  _id: string;
  trackerId: string;
  userId: string;
  author: ICommunityReviewAuthor;
  rating: number;
  comment: string;
  helpfulCount: number;
  helpfulByMe: boolean;
  isMine: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICommunityPublicTrackerDetail {
  _id: string;
  ownerId: string;
  title: string;
  description: string;
  category: string;
  field: string;
  goal: string;
  level: string;
  tags: string[];
  verified: boolean;
  visibility: string;
  status: string;
  allowClone: boolean;
  inDashboard: boolean;
  clones: number;
  likes: number;
  saves: number;
  topicsCount: number;
  subtopicsCount: number;
  author: ICommunityReviewAuthor;
  topics: ICommunityPublicTrackerTopic[];
  ratingSummary: ICommunityRatingSummary;
  reviews: ICommunityTrackerReview[];
  myReview?: ICommunityTrackerReview | null;
  likedByMe: boolean;
  createdAt?: string;
  publishedAt?: string | null;
}

export interface IToggleCommunityTrackerLikePayload {
  trackerId: string;
}

export interface IToggleCommunityTrackerLikeData {
  liked: boolean;
  likes: number;
}

export interface ICommunityPublicTrackerDetailData {
  tracker: ICommunityPublicTrackerDetail;
}

export interface IUpsertCommunityTrackerReviewPayload {
  trackerId: string;
  rating: number;
  comment: string;
}

export interface IUpsertCommunityTrackerReviewData {
  review: ICommunityTrackerReview;
  ratingSummary: ICommunityRatingSummary;
}

export interface IToggleCommunityReviewHelpfulPayload {
  trackerId: string;
  reviewId: string;
}

export interface IToggleCommunityReviewHelpfulData {
  review: ICommunityTrackerReview;
}

export interface ICommunityVerificationReviewSubtopic {
  id: string;
  topicId: string;
  parentSubtopicId?: string | null;
  title: string;
  description: string;
  order: number;
  depth: number;
  isLocked: boolean;
  estimatedMinutes: number;
}

export interface ICommunityVerificationReviewTopic {
  id: string;
  title: string;
  description: string;
  order: number;
  status: string;
  estimatedHours: number;
  subtopics: ICommunityVerificationReviewSubtopic[];
}

export interface ICommunityVerificationReviewTracker {
  id: string;
  title: string;
  description: string;
  category: string;
  field: string;
  goal: string;
  level: string;
  tags: string[];
  visibility: string;
  status: string;
  topicsCount: number;
  subtopicsCount: number;
  topics: ICommunityVerificationReviewTopic[];
}
