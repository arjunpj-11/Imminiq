import type { Request, Response, NextFunction, RequestParamHandler } from 'express'
import type { ZodTypeAny } from 'zod'

import { ApiError } from '../utils/ApiError'

type ValidationIssue = {
  path: readonly (string | number | symbol)[]
  message: string
}

type ValidationErrorMap = Record<string, string[]>

export class ValidationApiError extends ApiError {
  errors: ValidationErrorMap

  constructor(errors: ValidationErrorMap) {
    super(400, 'Validation failed', 'VALIDATION_ERROR')
    this.errors = errors
  }
}

const SAFE_IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]+$/

export const validateIdentifierParam: RequestParamHandler = (
  _req,
  _res,
  next,
  value,
  name,
) => {
  if (
    typeof value !== 'string' ||
    value.length < 1 ||
    value.length > 128 ||
    !SAFE_IDENTIFIER_PATTERN.test(value)
  ) {
    return next(new ValidationApiError({
      [name]: [`${name} is invalid`],
    }))
  }

  return next()
}

export const validateUsernameParam: RequestParamHandler = (
  _req,
  _res,
  next,
  value,
) => {
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(value)) {
    return next(new ValidationApiError({
      username: ['Username must contain 3-30 letters, numbers, or underscores'],
    }))
  }

  return next()
}

const formatValidationErrors = (
  issues: readonly ValidationIssue[]
): ValidationErrorMap => {
  return issues.reduce<ValidationErrorMap>((acc, issue) => {
    const field =
      issue.path.length > 0
        ? issue.path.map(String).join('.')
        : 'root'

    if (!acc[field]) {
      acc[field] = []
    }

    acc[field].push(issue.message)

    return acc
  }, {})
}

export const validate = (schema: ZodTypeAny) => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return next(
        new ValidationApiError(
          formatValidationErrors(result.error.issues)
        )
      )
    }

    req.body = result.data
    return next()
  }
}

export const validateQuery = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)

    if (!result.success) {
      return next(new ValidationApiError(formatValidationErrors(result.error.issues)))
    }

    return next()
  }
}
