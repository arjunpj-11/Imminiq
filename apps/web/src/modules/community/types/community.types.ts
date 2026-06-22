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
