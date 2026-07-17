import type { ErrorKind } from '../../../shared/errors/error-kind';
import { NotificationDomainError } from '../domain';

export type NotificationApplicationErrorCode = 'NOTIFICATION_NOT_FOUND' | 'INVALID_NOTIFICATION';

export class NotificationApplicationError extends NotificationDomainError {
  readonly kind: ErrorKind;
  private constructor(kind: ErrorKind, code: NotificationApplicationErrorCode, message: string) {
    super(code, message);
    this.name = 'NotificationApplicationError';
    this.kind = kind;
  }
  static notFound(message = 'Notification not found') {
    return new NotificationApplicationError('missing-resource', 'NOTIFICATION_NOT_FOUND', message);
  }
  static invalid(message: string) {
    return new NotificationApplicationError('invalid-input', 'INVALID_NOTIFICATION', message);
  }
}
