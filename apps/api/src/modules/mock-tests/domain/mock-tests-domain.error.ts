export class MockTestsDomainError extends Error {
  readonly code: string
  readonly isOperational = true

  constructor(code: string, message: string) {
    super(message)
    this.name = 'MockTestsDomainError'
    this.code = code

    const errorWithCapture = Error as typeof Error & {
      captureStackTrace?: (target: object) => void
    }
    errorWithCapture.captureStackTrace?.(this)
  }
}
