import type { Request, Response, NextFunction } from 'express'
import type { ZodTypeAny } from 'zod'

import { ApiError } from '../utils/ApiError'

type ValidationIssue = {
  path: readonly (string | number | symbol)[]
  message: string
}

type ValidationErrorMap = Record<string, string[]>

class ValidationApiError extends ApiError {
  errors: ValidationErrorMap

  constructor(errors: ValidationErrorMap) {
    super(400, 'Validation failed', 'VALIDATION_ERROR')
    this.errors = errors
  }
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