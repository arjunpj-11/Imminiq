import jwt, { type SignOptions, type VerifyOptions } from 'jsonwebtoken'

import { env } from '../../config/env'
import { ApiError } from '../utils/ApiError'

type AppealTokenPayload = {
  userId: string
  identifier: string
  purpose: 'moderation_appeal'
}

const JWT_OPTIONS: VerifyOptions = {
  algorithms: ['HS256'],
  issuer: 'imminiq-api',
  audience: 'imminiq-appeals',
}

const APPEAL_ISSUER = 'imminiq-api'
const APPEAL_AUDIENCE = 'imminiq-appeals'

export const createModerationAppealToken = (
  userId: string,
  identifier: string,
): string => jwt.sign(
  { userId, identifier, purpose: 'moderation_appeal' },
  env.JWT_SECRET,
  {
    algorithm: 'HS256',
    issuer: APPEAL_ISSUER,
    audience: APPEAL_AUDIENCE,
    expiresIn: '15m',
  } satisfies SignOptions,
)

export const verifyModerationAppealToken = (
  token: string,
): AppealTokenPayload => {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, JWT_OPTIONS) as Partial<AppealTokenPayload>

    if (
      payload.purpose !== 'moderation_appeal' ||
      typeof payload.userId !== 'string' ||
      typeof payload.identifier !== 'string'
    ) {
      throw new Error('Invalid appeal token payload')
    }

    return payload as AppealTokenPayload
  } catch {
    throw new ApiError(401, 'Appeal authorization is invalid or expired. Please sign in again.', 'APPEAL_TOKEN_INVALID')
  }
}
