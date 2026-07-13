export class NotificationDomainError extends Error {
  readonly code: string
  readonly isOperational = true

  constructor(code: string, message: string) {
    super(message)
    this.name = 'NotificationDomainError'
    this.code = code
    Error.captureStackTrace?.(this, NotificationDomainError)
  }
}
