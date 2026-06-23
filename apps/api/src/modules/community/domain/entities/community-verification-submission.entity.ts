import type { VerificationSubmissionStatus } from '../value-objects/verification-submission-status.vo'
import type { VerificationVoteChoice } from '../value-objects/verification-vote-choice.vo'

export type CommunityVerificationReviewSubtopic = {
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

export type CommunityVerificationReviewTopic = {
  id: string
  title: string
  description: string
  order: number
  status: string
  estimatedHours: number
  subtopics: CommunityVerificationReviewSubtopic[]
}

export type CommunityVerificationReviewTracker = {
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

export type CommunityVerificationSubmissionEntityProps = {
  id: string
  trackerId: string
  ownerId: string
  title: string
  category: string
  excerpt: string
  progress: number
  passVotes: number
  failVotes: number
  requiredVotes: number
  status: VerificationSubmissionStatus
  urgent: boolean
  userVote?: VerificationVoteChoice | null
  consensusChoice?: VerificationVoteChoice | null
  expiresAt?: Date | null
  createdAt?: Date
  reviewTracker?: CommunityVerificationReviewTracker | null
}

export class CommunityVerificationSubmissionEntity {
  readonly id: string
  readonly trackerId: string
  readonly ownerId: string
  readonly title: string
  readonly category: string
  readonly excerpt: string
  readonly progress: number
  readonly passVotes: number
  readonly failVotes: number
  readonly requiredVotes: number
  readonly status: VerificationSubmissionStatus
  readonly urgent: boolean
  readonly userVote?: VerificationVoteChoice | null
  readonly consensusChoice?: VerificationVoteChoice | null
  readonly expiresAt?: Date | null
  readonly createdAt?: Date
  readonly reviewTracker?: CommunityVerificationReviewTracker | null

  constructor(props: CommunityVerificationSubmissionEntityProps) {
    this.id = props.id
    this.trackerId = props.trackerId
    this.ownerId = props.ownerId
    this.title = props.title
    this.category = props.category
    this.excerpt = props.excerpt
    this.progress = props.progress
    this.passVotes = props.passVotes
    this.failVotes = props.failVotes
    this.requiredVotes = props.requiredVotes
    this.status = props.status
    this.urgent = props.urgent
    this.userVote = props.userVote
    this.consensusChoice = props.consensusChoice
    this.expiresAt = props.expiresAt
    this.createdAt = props.createdAt
    this.reviewTracker = props.reviewTracker ?? null
  }
}