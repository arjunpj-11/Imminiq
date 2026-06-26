import type { CommunitySort } from '../../domain/value-objects/community-sort.vo'
import type { VerificationVoteChoice } from '../../domain/value-objects/verification-vote-choice.vo'

export interface CommunityPaginationQuery {
  page?: number
  limit?: number
}

export interface CommunityTrackerListPayload extends CommunityPaginationQuery {
  userId: string
  search?: string
  topics?: string[]
  minRating?: number | null
  verifiedOnly?: boolean
  sort?: CommunitySort
}

export interface VerificationQueuePayload extends CommunityPaginationQuery {
  userId: string
}

export interface SubmitTrackerForVerificationPayload {
  trackerId: string
  userId: string
  requiredVotes?: number
  durationHours?: number
  urgent?: boolean
}

export interface CommunityTrackerView {
  _id: string
  title: string
  description: string
  rating: number
  clones: number
  verified: boolean
  inDashboard: boolean
  topic: string
}

export interface CommunityStatCardView {
  label: string
  value: string
  helper: string
}

export interface CommunityPaginationView {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface CommunityTrackerListView {
  trackers: CommunityTrackerView[]
  pagination: CommunityPaginationView
}

export interface CommunityBrowseView extends CommunityTrackerListView {
  stats: CommunityStatCardView[]
  topics: string[]
  verifyBanner: CommunityVerifyBannerView
}

export interface CommunityVerifyBannerView {
  queueCount: number
  rewardCoins: number
  activeReviewersThisWeek: number
}

export interface CommunityVerifyItemView {
  _id: string
  title: string
  category: string
  timeLeft: string
  excerpt: string
  progress: number
  votedPass: boolean
  closed: boolean
  urgent: boolean
  passVotes: number
  failVotes: number
  requiredVotes: number
}

export interface CommunityVerificationStatsView {
  awaiting: string
  reviewed: string
  totalEarned: string
  coinBalance: string
  queueCount: number
  rewardCoins: number
  activeReviewersThisWeek: number
}

export interface CommunityLeaderboardEntryView {
  rank: number
  name: string
  earned: string
  badge: string
  isMe?: boolean
}

export interface CommunityVerificationQueueView {
  items: CommunityVerifyItemView[]
  pagination: CommunityPaginationView
}

export interface CommunityVerificationDashboardView
  extends CommunityVerificationQueueView {
  stats: CommunityVerificationStatsView
  leaderboard: CommunityLeaderboardEntryView[]
  howItWorks: string[]
}


export interface CommunityVerificationSubmissionView extends CommunityVerifyItemView {
  trackerId: string
  ownerId: string
  userVote?: VerificationVoteChoice | null
  consensusChoice?: VerificationVoteChoice | null
  reviewTracker?: CommunityVerificationReviewTrackerView | null
}

export interface VoteVerificationSubmissionPayload {
  submissionId: string
  userId: string
  vote: VerificationVoteChoice
  reason?: string | null
}

export interface VoteVerificationSubmissionView {
  vote: {
    _id: string
    submissionId: string
    choice: VerificationVoteChoice
    rewardCoins: number
  }
  submission: CommunityVerificationSubmissionView
  reward: {
    awarded: boolean
    coins: number
    balance: number
  }
}

export type CommunityVerificationReviewSubtopicView = {
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

export type CommunityVerificationReviewTopicView = {
  id: string
  title: string
  description: string
  order: number
  status: string
  estimatedHours: number
  subtopics: CommunityVerificationReviewSubtopicView[]
}

export type CommunityVerificationReviewTrackerView = {
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
  topics: CommunityVerificationReviewTopicView[]
}