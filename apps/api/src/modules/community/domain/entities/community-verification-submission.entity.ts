import type { VerificationSubmissionStatus } from '../value-objects/verification-submission-status.vo'
import type { VerificationVoteChoice } from '../value-objects/verification-vote-choice.vo'

export type CommunityVerificationSubmissionEntityProps = {
  id: string
  trackerId: string
  ownerId: string
  title: string
  category: string
  excerpt: string
  progress: number
  status: VerificationSubmissionStatus
  urgent: boolean
  userVote?: VerificationVoteChoice | null
  consensusChoice?: VerificationVoteChoice | null
  expiresAt?: Date | null
  createdAt?: Date
}

export class CommunityVerificationSubmissionEntity {
  readonly id: string
  readonly trackerId: string
  readonly ownerId: string
  readonly title: string
  readonly category: string
  readonly excerpt: string
  readonly progress: number
  readonly status: VerificationSubmissionStatus
  readonly urgent: boolean
  readonly userVote?: VerificationVoteChoice | null
  readonly consensusChoice?: VerificationVoteChoice | null
  readonly expiresAt?: Date | null
  readonly createdAt?: Date

  constructor(props: CommunityVerificationSubmissionEntityProps) {
    this.id = props.id
    this.trackerId = props.trackerId
    this.ownerId = props.ownerId
    this.title = props.title
    this.category = props.category
    this.excerpt = props.excerpt
    this.progress = props.progress
    this.status = props.status
    this.urgent = props.urgent
    this.userVote = props.userVote
    this.consensusChoice = props.consensusChoice
    this.expiresAt = props.expiresAt
    this.createdAt = props.createdAt
  }
}
