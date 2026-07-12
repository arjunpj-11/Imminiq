export interface INotification {
  _id: string
  type: string
  message: string
  isRead: boolean
  deepLink?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface INotificationList {
  notifications: INotification[]
  total: number
  unreadCount: number
}
