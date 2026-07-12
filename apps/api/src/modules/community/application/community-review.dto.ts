export type CommunityReviewAuthorViewDTO = {
  _id: string
  name: string
  initials: string
  avatarUrl?: string | null
  role: string
}

export type CommunityTrackerReviewViewDTO = {
  _id: string
  trackerId: string
  userId: string
  author: CommunityReviewAuthorViewDTO
  rating: number
  comment: string
  helpfulCount: number
  helpfulByMe: boolean
  isMine: boolean
  createdAt?: string
  updatedAt?: string
}

export type CommunityPublicTrackerSubtopicViewDTO = {
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

export type CommunityPublicTrackerTopicViewDTO = {
  _id: string
  title: string
  description: string
  order: number
  status: string
  estimatedHours: number
  subtopics: CommunityPublicTrackerSubtopicViewDTO[]
}

export type CommunityRatingDistributionViewDTO = {
  1: number
  2: number
  3: number
  4: number
  5: number
}

export type CommunityRatingSummaryViewDTO = {
  average: number
  count: number
  distribution: CommunityRatingDistributionViewDTO
}

export type CommunityPublicTrackerDetailViewDTO = {
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
  likedByMe: boolean
  saves: number
  topicsCount: number
  subtopicsCount: number
  author: CommunityReviewAuthorViewDTO
  topics: CommunityPublicTrackerTopicViewDTO[]
  ratingSummary: CommunityRatingSummaryViewDTO
  reviews: CommunityTrackerReviewViewDTO[]
  myReview?: CommunityTrackerReviewViewDTO | null
  createdAt?: string
  publishedAt: string | null
}

export type UpsertCommunityTrackerReviewInputDTO = {
  rating: number
  comment: string
}

export type UpsertCommunityTrackerReviewPayloadDTO = {
  trackerId: string
  userId: string
  rating: number
  comment: string
}

export type ToggleCommunityReviewHelpfulPayloadDTO = {
  reviewId: string
  userId: string
}

export type ToggleCommunityTrackerLikePayloadDTO = {
  trackerId: string
  userId: string
}

export type UpsertCommunityTrackerReviewOutputDTO = {
  review: CommunityTrackerReviewViewDTO
  ratingSummary: CommunityRatingSummaryViewDTO
}

export type ToggleCommunityReviewHelpfulOutputDTO = {
  review: CommunityTrackerReviewViewDTO
}

export type ToggleCommunityTrackerLikeOutputDTO = {
  liked: boolean
  likes: number
}