import type { CommunitySort, VerificationVoteChoice } from '../domain/community.types';

export interface CommunityPaginationQueryDTO {
  page?: number;
  limit?: number;
}

export interface CommunityTrackerListPayloadDTO extends CommunityPaginationQueryDTO {
  userId: string;
  search?: string;
  topics?: string[];
  minRating?: number | null;
  verifiedOnly?: boolean;
  sort?: CommunitySort;
}

export interface VerificationQueuePayloadDTO extends CommunityPaginationQueryDTO {
  userId: string;
}

export interface SubmitTrackerForVerificationPayloadDTO {
  trackerId: string;
  userId: string;
  requiredVotes?: number;
  durationHours?: number;
  urgent?: boolean;
}

export interface CommunityTrackerViewDTO {
  _id: string;
  title: string;
  description: string;
  rating: number;
  clones: number;
  verified: boolean;
  inDashboard: boolean;
  topic: string;
}

export interface CloneCommunityTrackerResultDTO {
  tracker: CommunityTrackerViewDTO;
}

export interface CommunityStatCardViewDTO {
  label: string;
  value: string;
  helper: string;
}

export interface CommunityPaginationViewDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CommunityTrackerListViewDTO {
  trackers: CommunityTrackerViewDTO[];
  pagination: CommunityPaginationViewDTO;
}

export interface CommunityBrowseViewDTO extends CommunityTrackerListViewDTO {
  stats: CommunityStatCardViewDTO[];
  topics: string[];
  verifyBanner: CommunityVerifyBannerViewDTO;
}

export interface CommunityVerifyBannerViewDTO {
  queueCount: number;
  rewardCoins: number;
  activeReviewersThisWeek: number;
}

export interface CommunityVerifyItemViewDTO {
  _id: string;
  title: string;
  category: string;
  timeLeft: string;
  excerpt: string;
  progress: number;
  votedPass: boolean;
  closed: boolean;
  urgent: boolean;
  passVotes: number;
  failVotes: number;
  requiredVotes: number;
}

export interface CommunityVerificationStatsViewDTO {
  awaiting: string;
  reviewed: string;
  totalEarned: string;
  coinBalance: string;
  queueCount: number;
  rewardCoins: number;
  activeReviewersThisWeek: number;
}

export interface CommunityLeaderboardEntryViewDTO {
  rank: number;
  name: string;
  earned: string;
  badge: string;
  isMe?: boolean;
}

export interface CommunityVerificationQueueViewDTO {
  items: CommunityVerifyItemViewDTO[];
  pagination: CommunityPaginationViewDTO;
}

export interface CommunityVerificationDashboardViewDTO extends CommunityVerificationQueueViewDTO {
  stats: CommunityVerificationStatsViewDTO;
  leaderboard: CommunityLeaderboardEntryViewDTO[];
  howItWorks: string[];
}

export interface CommunityVerificationSubmissionViewDTO extends CommunityVerifyItemViewDTO {
  trackerId: string;
  ownerId: string;
  userVote?: VerificationVoteChoice | null;
  consensusChoice?: VerificationVoteChoice | null;
  reviewTracker?: CommunityVerificationReviewTrackerViewDTO | null;
}

export interface VoteVerificationSubmissionPayloadDTO {
  submissionId: string;
  userId: string;
  vote: VerificationVoteChoice;
  reason?: string | null;
}

export interface VoteVerificationSubmissionViewDTO {
  vote: {
    _id: string;
    submissionId: string;
    choice: VerificationVoteChoice;
    rewardCoins: number;
  };
  submission: CommunityVerificationSubmissionViewDTO;
  reward: {
    awarded: boolean;
    coins: number;
    balance: number;
  };
}

export type CommunityVerificationReviewSubtopicViewDTO = {
  id: string;
  topicId: string;
  parentSubtopicId?: string | null;
  title: string;
  description: string;
  order: number;
  depth: number;
  isLocked: boolean;
};

export type CommunityVerificationReviewTopicViewDTO = {
  id: string;
  title: string;
  description: string;
  order: number;
  status: string;
  subtopics: CommunityVerificationReviewSubtopicViewDTO[];
};

export type CommunityVerificationReviewTrackerViewDTO = {
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
  topics: CommunityVerificationReviewTopicViewDTO[];
};
