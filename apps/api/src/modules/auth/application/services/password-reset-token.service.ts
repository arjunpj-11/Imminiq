import { randomUUID } from 'crypto'
import jwt, { SignOptions } from 'jsonwebtoken'

import { env } from '../../../../config/env'
import { ApiError } from '../../../../shared/utils/ApiError'
import { passwordResetSessionCache } from '../../../../infrastructure/cache/password-reset-session.cache'
import type { ResetTokenPayload } from '../../domain/types/auth.types'

const PASSWORD_RESET_TOKEN_EXPIRES_SECONDS = 10 * 60

export const generatePasswordResetToken = async (
  userId: string
): Promise<string> => {
  const jti = randomUUID()

  const resetTokenOptions: SignOptions = {
    expiresIn: '10m',
  }

  const token = jwt.sign(
    {
      userId,
      purpose: 'password_reset',
      jti,
    },
    env.JWT_SECRET,
    resetTokenOptions
  )

  await passwordResetSessionCache.save(
    jti,
    userId,
    PASSWORD_RESET_TOKEN_EXPIRES_SECONDS
  )

  return token
}

export const verifyPasswordResetToken = (
  resetToken: string
): ResetTokenPayload => {
  let decoded: ResetTokenPayload

  try {
    decoded = jwt.verify(
      resetToken,
      env.JWT_SECRET
    ) as ResetTokenPayload
  } catch {
    throw new ApiError(
      400,
      'Invalid or expired reset token',
      'INVALID_RESET_TOKEN'
    )
  }

  if (
    decoded.purpose !== 'password_reset' ||
    !decoded.userId ||
    !decoded.jti
  ) {
    throw new ApiError(
      400,
      'Invalid reset token',
      'INVALID_RESET_TOKEN'
    )
  }

  return decoded
}
