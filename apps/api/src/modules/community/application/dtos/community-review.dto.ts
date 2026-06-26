export type CommunityReviewAuthorView = {
  _id: string
  name: string
  initials: string
  avatarUrl?: string | null
  role: string
}

export type CommunityTrackerReviewView = {
  _id: string
  trackerId: string
  userId: string
  author: CommunityReviewAuthorView
  rating: number
  comment: string
  helpfulCount: number
  helpfulByMe: boolean
  isMine: boolean
  createdAt?: string
  updatedAt?: string
}

export type CommunityPublicTrackerSubtopicView = {
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

export type CommunityPublicTrackerTopicView = {
  _id: string
  title: string
  description: string
  order: number
  status: string
  estimatedHours: number
  subtopics: CommunityPublicTrackerSubtopicView[]
}

export type CommunityRatingDistributionView = {
  1: number
  2: number
  3: number
  4: number
  5: number
}

export type CommunityRatingSummaryView = {
  average: number
  count: number
  distribution: CommunityRatingDistributionView
}

export type CommunityPublicTrackerDetailView = {
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
  author: CommunityReviewAuthorView
  topics: CommunityPublicTrackerTopicView[]
  ratingSummary: CommunityRatingSummaryView
  reviews: CommunityTrackerReviewView[]
  myReview?: CommunityTrackerReviewView | null
  createdAt?: string
  publishedAt: string | null
}

export type UpsertCommunityTrackerReviewInputDto = {
  rating: number
  comment: string
}

export type UpsertCommunityTrackerReviewPayload = {
  trackerId: string
  userId: string
  rating: number
  comment: string
}

export type ToggleCommunityReviewHelpfulPayload = {
  reviewId: string
  userId: string
}

export type ToggleCommunityTrackerLikePayload = {
  trackerId: string
  userId: string
}

export type UpsertCommunityTrackerReviewOutputDto = {
  review: CommunityTrackerReviewView
  ratingSummary: CommunityRatingSummaryView
}

export type ToggleCommunityReviewHelpfulOutputDto = {
  review: CommunityTrackerReviewView
}

export type ToggleCommunityTrackerLikeOutputDto = {
  liked: boolean
  likes: number
}