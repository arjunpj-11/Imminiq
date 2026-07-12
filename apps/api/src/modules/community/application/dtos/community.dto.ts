import type { CommunitySort } from '../../domain/value-objects/community-sort.vo'
import type { VerificationVoteChoice } from '../../domain/value-objects/verification-vote-choice.vo'

export interface ICommunityPaginationQueryDTO {
  page?: number
  limit?: number
}

export interface ICommunityTrackerListPayloadDTO extends ICommunityPaginationQueryDTO {
  userId: string
  search?: string
  topics?: string[]
  minRating?: number | null
  verifiedOnly?: boolean
  sort?: CommunitySort
}

export interface IVerificationQueuePayloadDTO extends ICommunityPaginationQueryDTO {
  userId: string
}

export interface ISubmitTrackerForVerificationPayloadDTO {
  trackerId: string
  userId: string
  requiredVotes?: number
  durationHours?: number
  urgent?: boolean
}

export interface ICommunityTrackerViewDTO {
  _id: string
  title: string
  description: string
  rating: number
  clones: number
  verified: boolean
  inDashboard: boolean
  topic: string
}

export interface ICommunityStatCardViewDTO {
  label: string
  value: string
  helper: string
}

export interface ICommunityPaginationViewDTO {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ICommunityTrackerListViewDTO {
  trackers: ICommunityTrackerViewDTO[]
  pagination: ICommunityPaginationViewDTO
}

export interface ICommunityBrowseViewDTO extends ICommunityTrackerListViewDTO {
  stats: ICommunityStatCardViewDTO[]
  topics: string[]
  verifyBanner: ICommunityVerifyBannerViewDTO
}

export interface ICommunityVerifyBannerViewDTO {
  queueCount: number
  rewardCoins: number
  activeReviewersThisWeek: number
}

export interface ICommunityVerifyItemViewDTO {
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

export interface ICommunityVerificationStatsViewDTO {
  awaiting: string
  reviewed: string
  totalEarned: string
  coinBalance: string
  queueCount: number
  rewardCoins: number
  activeReviewersThisWeek: number
}

export interface ICommunityLeaderboardEntryViewDTO {
  rank: number
  name: string
  earned: string
  badge: string
  isMe?: boolean
}

export interface ICommunityVerificationQueueViewDTO {
  items: ICommunityVerifyItemViewDTO[]
  pagination: ICommunityPaginationViewDTO
}

export interface ICommunityVerificationDashboardViewDTO
  extends ICommunityVerificationQueueViewDTO {
  stats: ICommunityVerificationStatsViewDTO
  leaderboard: ICommunityLeaderboardEntryViewDTO[]
  howItWorks: string[]
}


export interface ICommunityVerificationSubmissionViewDTO extends ICommunityVerifyItemViewDTO {
  trackerId: string
  ownerId: string
  userVote?: VerificationVoteChoice | null
  consensusChoice?: VerificationVoteChoice | null
  reviewTracker?: CommunityVerificationReviewTrackerViewDTO | null
}

export interface IVoteVerificationSubmissionPayloadDTO {
  submissionId: string
  userId: string
  vote: VerificationVoteChoice
  reason?: string | null
}

export interface IVoteVerificationSubmissionViewDTO {
  vote: {
    _id: string
    submissionId: string
    choice: VerificationVoteChoice
    rewardCoins: number
  }
  submission: ICommunityVerificationSubmissionViewDTO
  reward: {
    awarded: boolean
    coins: number
    balance: number
  }
}

export type CommunityVerificationReviewSubtopicViewDTO = {
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

export type CommunityVerificationReviewTopicViewDTO = {
  id: string
  title: string
  description: string
  order: number
  status: string
  estimatedHours: number
  subtopics: CommunityVerificationReviewSubtopicViewDTO[]
}

export type CommunityVerificationReviewTrackerViewDTO = {
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
  topics: CommunityVerificationReviewTopicViewDTO[]
}