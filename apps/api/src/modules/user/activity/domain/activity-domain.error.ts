export class ActivityDomainError extends Error {
  readonly code: string
  readonly isOperational = true

  constructor(code: string, message: string) {
    super(message)
    this.name = 'ActivityDomainError'
    this.code = code

    const errorConstructor = Error as ErrorConstructor & {
      captureStackTrace?: (target: object) => void
    }

    errorConstructor.captureStackTrace?.(this)
  }
}
