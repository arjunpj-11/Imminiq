import { NotificationDomainError } from '../domain'

export type NotificationApplicationErrorCode = 'NOTIFICATION_NOT_FOUND' | 'INVALID_NOTIFICATION'

export class NotificationApplicationError extends NotificationDomainError {
  readonly statusCode: number
  private constructor(statusCode: number, code: NotificationApplicationErrorCode, message: string) {
    super(code, message)
    this.name = 'NotificationApplicationError'
    this.statusCode = statusCode
  }
  static notFound() { return new NotificationApplicationError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found') }
  static invalid(message: string) { return new NotificationApplicationError(400, 'INVALID_NOTIFICATION', message) }
}
