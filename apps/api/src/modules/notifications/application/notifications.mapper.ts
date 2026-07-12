import type { NotificationEntity } from '../domain'
import type { ListNotificationsResponseDTO, NotificationDTO } from './notifications.dto'

export class NotificationsMapper {
  toNotificationDTO(entity: NotificationEntity): NotificationDTO {
    return { id: entity.id, type: entity.type, message: entity.message, isRead: entity.isRead, deepLink: entity.deepLink, metadata: entity.metadata, createdAt: entity.createdAt.toISOString() }
  }
  toListResponse(input: { notifications: NotificationEntity[]; total: number; unreadCount: number; page: number; limit: number }): ListNotificationsResponseDTO {
    const totalPages = Math.ceil(input.total / input.limit)
    return {
      notifications: input.notifications.map((item) => this.toNotificationDTO(item)),
      pagination: { page: input.page, limit: input.limit, totalItems: input.total, totalPages, hasNextPage: input.page < totalPages, hasPreviousPage: input.page > 1 },
      unreadCount: input.unreadCount,
    }
  }
}
