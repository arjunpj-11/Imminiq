export class ApiError extends Error {
  statusCode: number
  code: string

  constructor(statusCode: number, message: string, code = 'ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    Error.captureStackTrace(this, this.constructor)
  }
}
