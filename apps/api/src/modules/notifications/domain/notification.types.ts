export interface NotificationEntity {
  _id: string
  type: string
  message: string
  isRead: boolean
  deepLink?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}
