import type { ActivityCategory } from '../value-objects/activity-category.vo'
import type { ActivityType } from '../value-objects/activity-type.vo'
import type { ActivityXpBucket } from '../value-objects/activity-xp-bucket.vo'

export type ActivityDifficulty =
  | 'beginner'
  | 'intermediate'
  | 'advanced'

export type ActivityDetails = {
  scorePercentage?: number
  totalQuestions?: number
  correctAnswers?: number
  durationSeconds?: number
  previousLevel?: number
  currentLevel?: number
  milestoneValue?: number
  previousRank?: number
  currentRank?: number
  difficulty?: ActivityDifficulty
}

export type UserActivityEntityProps = {
  id: string
  userId: string

  category: ActivityCategory
  type: ActivityType

  title: string
  subtitle: string

  xpAwarded: number
  xpBucket: ActivityXpBucket
  coinsAwarded: number

  eventKey: string

  trackerId: string | null
  topicId: string | null
  subtopicId: string | null
  mockTestId: string | null
  attemptId: string | null
  sourceUserId: string | null

  details: ActivityDetails

  occurredAt: Date
  deletedAt: Date | null

  createdAt?: Date
  updatedAt?: Date
}

export class UserActivityEntity {
  readonly id: string
  readonly userId: string

  readonly category: ActivityCategory
  readonly type: ActivityType

  readonly title: string
  readonly subtitle: string

  readonly xpAwarded: number
  readonly xpBucket: ActivityXpBucket
  readonly coinsAwarded: number

  readonly eventKey: string

  readonly trackerId: string | null
  readonly topicId: string | null
  readonly subtopicId: string | null
  readonly mockTestId: string | null
  readonly attemptId: string | null
  readonly sourceUserId: string | null

  readonly details: ActivityDetails

  readonly occurredAt: Date
  readonly deletedAt: Date | null

  readonly createdAt: Date | undefined
  readonly updatedAt: Date | undefined

  constructor(props: UserActivityEntityProps) {
    this.id = props.id
    this.userId = props.userId

    this.category = props.category
    this.type = props.type

    this.title = props.title
    this.subtitle = props.subtitle

    this.xpAwarded = props.xpAwarded
    this.xpBucket = props.xpBucket
    this.coinsAwarded = props.coinsAwarded

    this.eventKey = props.eventKey

    this.trackerId = props.trackerId
    this.topicId = props.topicId
    this.subtopicId = props.subtopicId
    this.mockTestId = props.mockTestId
    this.attemptId = props.attemptId
    this.sourceUserId = props.sourceUserId

    this.details = props.details

    this.occurredAt = props.occurredAt
    this.deletedAt = props.deletedAt

    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }
}
