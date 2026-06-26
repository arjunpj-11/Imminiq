export type CommunitySort = 'top-rated' | 'most-cloned' | 'newest'

export type VerificationVoteChoice = 'pass' | 'fail'

export interface ApiResponse<TData> {
  success: boolean
  message: string
  data?: TData | null
  meta?: object
}

export interface ApiErrorResponse {
  success?: boolean
  message?: string
  code?: string
}

export interface CommunityPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface CommunityTracker {
  _id: string
  title: string
  description: string
  rating: number
  clones: number
  verified: boolean
  inDashboard: boolean
  topic: string
}

export interface CommunityStatCard {
  label: string
  value: string
  helper: string
}

export interface CommunityVerifyBanner {
  queueCount: number
  rewardCoins: number
  activeReviewersThisWeek: number
}

export interface CommunityBrowseData {
  trackers: CommunityTracker[]
  pagination: CommunityPagination
  stats: CommunityStatCard[]
  topics: string[]
  verifyBanner: CommunityVerifyBanner
}

export interface CommunityTrackerListData {
  trackers: CommunityTracker[]
  pagination: CommunityPagination
}

export interface CommunityVerifyItem {
  _id: string
  title: string
  category: string
  timeLeft: string
  excerpt: string
  progress: number
  passVotes: number
  failVotes: number
  requiredVotes: number
  votedPass: boolean
  closed: boolean
  urgent: boolean
}

export interface CommunityVerificationStats {
  awaiting: string
  reviewed: string
  totalEarned: string
  coinBalance: string
  queueCount: number
  rewardCoins: number
  activeReviewersThisWeek: number
}

export interface CommunityLeaderboardEntry {
  rank: number
  name: string
  earned: string
  badge: string
  isMe?: boolean
}

export interface CommunityVerificationQueueData {
  items: CommunityVerifyItem[]
  pagination: CommunityPagination
}

export interface CommunityVerificationDashboardData
  extends CommunityVerificationQueueData {
  stats: CommunityVerificationStats
  leaderboard: CommunityLeaderboardEntry[]
  howItWorks: string[]
}

export interface CommunityVerificationSubmission
  extends CommunityVerifyItem {
  trackerId: string
  ownerId: string
  userVote?: VerificationVoteChoice | null
  consensusChoice?: VerificationVoteChoice | null
  reviewTracker?: CommunityVerificationReviewTracker | null
}

export interface VoteVerificationSubmissionPayload {
  submissionId: string
  vote: VerificationVoteChoice
  reason?: string | null
}

export interface VoteVerificationSubmissionData {
  vote: {
    _id: string
    submissionId: string
    choice: VerificationVoteChoice
    rewardCoins: number
  }
  submission: CommunityVerificationSubmission
  reward: {
    awarded: boolean
    coins: number
    balance: number
  }
}

export interface CommunityBrowseQuery {
  search?: string
  topics?: string[]
  minRating?: number | null
  verifiedOnly?: boolean
  sort?: CommunitySort
  page?: number
  limit?: number
}

export interface CommunityReviewAuthor {
  _id: string
  name: string
  initials: string
  avatarUrl?: string | null
  role: string
}

export interface CommunityPublicTrackerSubtopic {
  _id: string
  topicId: string
  parentSubtopicId?: string | null
  title: string
  description: string
  order: number
  depth: number
  isLocked: boolean
  estimatedMinutes: number
}

export interface CommunityPublicTrackerTopic {
  _id: string
  title: string
  description: string
  order: number
  status: string
  estimatedHours: number
  subtopics: CommunityPublicTrackerSubtopic[]
}

export interface CommunityRatingDistribution {
  1: number
  2: number
  3: number
  4: number
  5: number
}

export interface CommunityRatingSummary {
  average: number
  count: number
  distribution: CommunityRatingDistribution
}

export interface CommunityTrackerReview {
  _id: string
  trackerId: string
  userId: string
  author: CommunityReviewAuthor
  rating: number
  comment: string
  helpfulCount: number
  helpfulByMe: boolean
  isMine: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CommunityPublicTrackerDetail {
  _id: string
  ownerId: string
  title: string
  description: string
  category: string
  field: string
  goal: string
  level: string
  tags: string[]
  verified: boolean
  visibility: string
  status: string
  allowClone: boolean
  inDashboard: boolean
  clones: number
  likes: number
  saves: number
  topicsCount: number
  subtopicsCount: number
  author: CommunityReviewAuthor
  topics: CommunityPublicTrackerTopic[]
  ratingSummary: CommunityRatingSummary
  reviews: CommunityTrackerReview[]
  myReview?: CommunityTrackerReview | null
  likedByMe: boolean
  createdAt?: string
  publishedAt?: string | null
}

export interface ToggleCommunityTrackerLikePayload {
  trackerId: string
}

export interface ToggleCommunityTrackerLikeData {
  liked: boolean
  likes: number
}

export interface CommunityPublicTrackerDetailData {
  tracker: CommunityPublicTrackerDetail
}

export interface UpsertCommunityTrackerReviewPayload {
  trackerId: string
  rating: number
  comment: string
}

export interface UpsertCommunityTrackerReviewData {
  review: CommunityTrackerReview
  ratingSummary: CommunityRatingSummary
}

export interface ToggleCommunityReviewHelpfulPayload {
  trackerId: string
  reviewId: string
}

export interface ToggleCommunityReviewHelpfulData {
  review: CommunityTrackerReview
}

export interface CommunityVerificationReviewSubtopic {
  id: string
  topicId: string
  parentSubtopicId?: string | null
  title: string
  description: string
  order: number
  depth: number
  isLocked: boolean
  estimatedMinutes: number
}

export interface CommunityVerificationReviewTopic {
  id: string
  title: string
  description: string
  order: number
  status: string
  estimatedHours: number
  subtopics: CommunityVerificationReviewSubtopic[]
}

export interface CommunityVerificationReviewTracker {
  id: string
  title: string
  description: string
  category: string
  field: string
  goal: string
  level: string
  tags: string[]
  visibility: string
  status: string
  topicsCount: number
  subtopicsCount: number
  topics: CommunityVerificationReviewTopic[]
}