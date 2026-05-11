import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { ApiError } from '../utils/ApiError'

export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const firstIssue = result.error.issues[0]

      throw new ApiError(
        400,
        firstIssue?.message || 'Validation failed',
        'VALIDATION_ERROR'
      )
    }

    req.body = result.data
    next()
  }