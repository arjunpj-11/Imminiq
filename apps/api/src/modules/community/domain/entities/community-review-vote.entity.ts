import type { VerificationVoteChoice } from '../value-objects/verification-vote-choice.vo'

export type CommunityReviewVoteEntityProps = {
  id: string
  submissionId: string
  userId: string
  choice: VerificationVoteChoice
  reason?: string | null
  rewardCoins: number
  createdAt?: Date
}

export class CommunityReviewVoteEntity {
  readonly id: string
  readonly submissionId: string
  readonly userId: string
  readonly choice: VerificationVoteChoice
  readonly reason?: string | null
  readonly rewardCoins: number
  readonly createdAt?: Date

  constructor(props: CommunityReviewVoteEntityProps) {
    this.id = props.id
    this.submissionId = props.submissionId
    this.userId = props.userId
    this.choice = props.choice
    this.reason = props.reason
    this.rewardCoins = props.rewardCoins
    this.createdAt = props.createdAt
  }
}
