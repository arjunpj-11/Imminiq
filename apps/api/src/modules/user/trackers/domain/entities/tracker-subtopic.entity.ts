import type { SubtopicStatus } from '../value-objects/subtopic-status.vo'

export type TrackerSubtopicEntityProps = {
  id: string
  trackerId: string
  topicId: string
  parentSubtopicId?: string | null
  title: string
  description: string
  order: number
  depth: number
  isLocked: boolean
  estimatedMinutes?: number
  status?: SubtopicStatus
  isUnlocked?: boolean
  progressPercent?: number
  completedAt?: Date | null
}

export class TrackerSubtopicEntity {
  readonly id: string
  readonly trackerId: string
  readonly topicId: string
  readonly parentSubtopicId: string | null
  readonly title: string
  readonly description: string
  readonly order: number
  readonly depth: number
  readonly isLocked: boolean
  readonly estimatedMinutes: number
  readonly status?: SubtopicStatus
  readonly isUnlocked?: boolean
  readonly progressPercent?: number
  readonly completedAt?: Date | null

  constructor(props: TrackerSubtopicEntityProps) {
    this.id = props.id
    this.trackerId = props.trackerId
    this.topicId = props.topicId
    this.parentSubtopicId = props.parentSubtopicId ?? null
    this.title = props.title
    this.description = props.description
    this.order = props.order
    this.depth = props.depth
    this.isLocked = props.isLocked
    this.estimatedMinutes = props.estimatedMinutes ?? 0
    this.status = props.status
    this.isUnlocked = props.isUnlocked
    this.progressPercent = props.progressPercent
    this.completedAt = props.completedAt
  }
}
