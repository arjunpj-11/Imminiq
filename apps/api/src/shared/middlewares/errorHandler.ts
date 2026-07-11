import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

import { ApiError } from '../utils/ApiError'

type ErrorDetails = Record<string, string[]>

type HttpOperationalError = Error & {
  statusCode: number
  code: string
  errors?: ErrorDetails
  data?: Record<string, unknown>
}

const formatZodErrors = (
  error: ZodError
): ErrorDetails => {
  const errors: ErrorDetails = {}

  for (const issue of error.issues) {
    const field =
      issue.path.length > 0
        ? issue.path.map(String).join('.')
        : '_root'

    errors[field] = [
      ...(errors[field] ?? []),
      issue.message,
    ]
  }

  return errors
}

const isHttpOperationalError = (
  err: Error
): err is HttpOperationalError => {
  const possibleError = err as Partial<HttpOperationalError>

  return (
    typeof possibleError.statusCode === 'number' &&
    Number.isInteger(possibleError.statusCode) &&
    possibleError.statusCode >= 400 &&
    possibleError.statusCode <= 599 &&
    typeof possibleError.code === 'string'
  )
}

const buildErrorResponse = (
  err: HttpOperationalError
) => {
  return {
    success: false,
    message: err.message,
    code: err.code,
    ...(err.errors ? { errors: err.errors } : {}),
    ...(err.data ? { data: err.data } : {}),
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: formatZodErrors(err),
    })
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...('errors' in err && err.errors
        ? { errors: err.errors as ErrorDetails }
        : {}),
    })
  }

  if (isHttpOperationalError(err)) {
    return res.status(err.statusCode).json(buildErrorResponse(err))
  }

  console.error(err)

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  })
}
