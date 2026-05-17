import jwt, { SignOptions } from 'jsonwebtoken'

import { env } from '../../../../config/env'
import { ApiError } from '../../../../shared/utils/ApiError'
import type { ResetTokenPayload } from '../../domain/types/auth.types'

export const generatePasswordResetToken = (userId: string) => {
  const resetTokenOptions: SignOptions = {
    expiresIn: '10m',
  }

  return jwt.sign(
    {
      userId,
      purpose: 'password_reset',
    },
    env.JWT_SECRET,
    resetTokenOptions
  )
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

  if (decoded.purpose !== 'password_reset') {
    throw new ApiError(
      400,
      'Invalid reset token',
      'INVALID_RESET_TOKEN'
    )
  }

  return decoded
}
