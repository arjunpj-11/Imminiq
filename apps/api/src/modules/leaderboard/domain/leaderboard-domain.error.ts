export class LeaderboardDomainError extends Error {
  readonly code: string
  readonly isOperational = true

  constructor(code: string, message: string) {
    super(message)
    this.name = 'LeaderboardDomainError'
    this.code = code

    const errorConstructor = Error as ErrorConstructor & {
      captureStackTrace?: (target: object) => void
    }

    errorConstructor.captureStackTrace?.(this)
  }
}
