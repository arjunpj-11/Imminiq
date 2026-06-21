import type { TrackerDomain } from '../value-objects/tracker-domain.vo'
import type { TrackerLevel } from '../value-objects/tracker-level.vo'
import type { TrackerStatus } from '../value-objects/tracker-status.vo'
import type { TrackerVisibility } from '../value-objects/tracker-visibility.vo'

export type TrackerEntityProps = {
  id: string
  ownerId?: string
  title?: string
  description?: string
  domain?: TrackerDomain | string
  goal?: string
  level?: TrackerLevel | string
  tags?: string[]
  allowClone?: boolean
  status?: TrackerStatus
  visibility?: TrackerVisibility
  progressPercent?: number
  topicsCount?: number
  subtopicsCount?: number
  completedSubtopicsCount?: number
  publishedAt?: Date | null
  completedAt?: Date | null
  lastActiveAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
}

export class TrackerEntity {
  readonly id: string
  readonly ownerId?: string
  readonly title?: string
  readonly description?: string
  readonly domain?: TrackerDomain | string
  readonly goal?: string
  readonly level?: TrackerLevel | string
  readonly tags: string[]
  readonly allowClone?: boolean
  readonly status?: TrackerStatus
  readonly visibility?: TrackerVisibility
  readonly progressPercent: number
  readonly topicsCount: number
  readonly subtopicsCount: number
  readonly completedSubtopicsCount: number
  readonly publishedAt?: Date | null
  readonly completedAt?: Date | null
  readonly lastActiveAt?: Date | null
  readonly createdAt?: Date
  readonly updatedAt?: Date

  constructor(props: TrackerEntityProps) {
    this.id = props.id
    this.ownerId = props.ownerId
    this.title = props.title
    this.description = props.description
    this.domain = props.domain
    this.goal = props.goal
    this.level = props.level
    this.tags = props.tags ?? []
    this.allowClone = props.allowClone
    this.status = props.status
    this.visibility = props.visibility
    this.progressPercent = props.progressPercent ?? 0
    this.topicsCount = props.topicsCount ?? 0
    this.subtopicsCount = props.subtopicsCount ?? 0
    this.completedSubtopicsCount = props.completedSubtopicsCount ?? 0
    this.publishedAt = props.publishedAt
    this.completedAt = props.completedAt
    this.lastActiveAt = props.lastActiveAt
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }
}
