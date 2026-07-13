import type { TopicStatus } from '../value-objects/topic-status.vo'

export type TrackerTopicEntityProps = {
  id: string
  trackerId?: string
  title: string
  description?: string
  order: number
  estimatedHours?: number
  status?: TopicStatus
  progressPercent?: number
}

export class TrackerTopicEntity {
  readonly id: string
  readonly trackerId?: string
  readonly title: string
  readonly description?: string
  readonly order: number
  readonly estimatedHours: number
  readonly status?: TopicStatus
  readonly progressPercent?: number

  constructor(props: TrackerTopicEntityProps) {
    this.id = props.id
    this.trackerId = props.trackerId
    this.title = props.title
    this.description = props.description
    this.order = props.order
    this.estimatedHours = props.estimatedHours ?? 0
    this.status = props.status
    this.progressPercent = props.progressPercent
  }
}
