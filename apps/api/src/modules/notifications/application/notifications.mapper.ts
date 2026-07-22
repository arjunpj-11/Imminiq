import type { NotificationEntity } from '../domain';
import type {
  ListNotificationsResponseDTO,
  NotificationDTO,
  NotificationPageMappingInputDTO,
} from './notifications.dto';

export interface INotificationsMapper {
  toNotificationDTO(entity: NotificationEntity): NotificationDTO;
  toListResponse(input: NotificationPageMappingInputDTO): ListNotificationsResponseDTO;
}

export class NotificationsMapper implements INotificationsMapper {
  toNotificationDTO(entity: NotificationEntity): NotificationDTO {
    return {
      id: entity.id,
      type: entity.type,
      message: entity.message,
      isRead: entity.isRead,
      deepLink: entity.deepLink,
      metadata: entity.metadata,
      createdAt: entity.createdAt.toISOString(),
    };
  }
  toListResponse(input: NotificationPageMappingInputDTO): ListNotificationsResponseDTO {
    const totalPages = Math.ceil(input.total / input.limit);
    return {
      notifications: input.notifications.map((item) => this.toNotificationDTO(item)),
      pagination: {
        page: input.page,
        limit: input.limit,
        totalItems: input.total,
        totalPages,
        hasNextPage: input.page < totalPages,
        hasPreviousPage: input.page > 1,
      },
      unreadCount: input.unreadCount,
    };
  }
}
