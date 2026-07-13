import { NotificationDomainError } from '../../../domain';

export class MongoNotificationsErrorMapper {
  static map(error: unknown, fallback: string) {
    if (error instanceof NotificationDomainError) return error;
    return new NotificationDomainError(
      'NOTIFICATION_PERSISTENCE_ERROR',
      error instanceof Error ? error.message : fallback
    );
  }
}
