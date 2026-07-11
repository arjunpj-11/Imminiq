import type { NextFunction, Request, Response } from 'express'

import { ApiError } from '../utils/ApiError'
import { verifyModerationAppealToken } from '../security/moderation-appeal-token.util'

export const authenticateModerationAppeal = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authorization = req.get('authorization') ?? ''
  const match = /^Bearer\s+(\S+)$/i.exec(authorization)

  if (!match) {
    next(new ApiError(401, 'Appeal authorization is required. Please sign in again.', 'APPEAL_TOKEN_REQUIRED'))
    return
  }

  const payload = verifyModerationAppealToken(match[1])
  res.locals.appealAuthorization = payload
  next()
}
