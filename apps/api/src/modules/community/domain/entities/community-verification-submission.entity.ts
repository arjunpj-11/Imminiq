import type {
  VerificationSubmissionStatus,
  VerificationVoteChoice,
} from '../types/community.types'

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
    this.userVote = props.userVote ?? null
    this.consensusChoice = props.consensusChoice ?? null
    this.expiresAt = props.expiresAt ?? null
    this.createdAt = props.createdAt
    this.reviewTracker = props.reviewTracker ?? null
  }

  get votedPass(): boolean {
    return this.userVote === 'pass'
  }

  get votedFail(): boolean {
    return this.userVote === 'fail'
  }

  get closed(): boolean {
    return this.status !== 'open'
  }

  timeLeftAt(now: Date): string {
    if (this.closed || !this.expiresAt) {
      return ''
    }

    const expiresTime = new Date(this.expiresAt).getTime()

    if (Number.isNaN(expiresTime)) {
      return ''
    }

    const diffMs = expiresTime - now.getTime()

    if (diffMs <= 0) {
      return ''
    }

    const totalMinutes = Math.ceil(diffMs / 60000)
    const days = Math.floor(totalMinutes / 1440)
    const hours = Math.floor((totalMinutes % 1440) / 60)
    const minutes = totalMinutes % 60

    if (days > 0) {
      return `${days}d`
    }

    if (hours > 0) {
      return `${hours}h`
    }

    return `${Math.max(minutes, 1)}m`
  }
}
