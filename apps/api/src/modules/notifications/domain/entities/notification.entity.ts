import type { NotificationMetadata, NotificationType } from '../notification.types'

export type NotificationEntityProps = {
  id: string
  userId: string
  type: NotificationType
  message: string
  isRead: boolean
  deepLink: string | null
  metadata: NotificationMetadata
  createdAt: Date
  updatedAt: Date
}

export class NotificationEntity {
  readonly id: string
  readonly userId: string
  readonly type: NotificationType
  readonly message: string
  readonly isRead: boolean
  readonly deepLink: string | null
  readonly metadata: NotificationMetadata
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(props: NotificationEntityProps) {
    this.id = props.id
    this.userId = props.userId
    this.type = props.type
    this.message = props.message
    this.isRead = props.isRead
    this.deepLink = props.deepLink
    this.metadata = props.metadata
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }
}
