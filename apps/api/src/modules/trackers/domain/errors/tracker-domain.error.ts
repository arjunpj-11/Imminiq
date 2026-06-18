export class TrackerDomainError extends Error {
  readonly code: string
  readonly isOperational = true

  constructor(code: string, message: string) {
    super(message)
    this.name = 'TrackerDomainError'
    this.code = code

    const errorConstructor = this.constructor as new (...args: unknown[]) => unknown
    const stackTrace = Error as ErrorConstructor & {
      captureStackTrace?: (targetObject: object, constructorOpt?: unknown) => void
    }

    stackTrace.captureStackTrace?.(this, errorConstructor)
  }
}
