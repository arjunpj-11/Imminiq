import jwt from 'jsonwebtoken'
import { env } from '../../config/env'

interface ResetTokenPayload {
  userId: string
  purpose: 'password_reset'
}

export const createPasswordResetToken = (userId: string) => {
  return jwt.sign(
    {
      userId,
      purpose: 'password_reset',
    },
    env.JWT_SECRET,
    {
      expiresIn: '10m',
    }
  )
}

export const verifyPasswordResetToken = (token: string) => {
  const decoded = jwt.verify(token, env.JWT_SECRET) as ResetTokenPayload

  if (decoded.purpose !== 'password_reset') {
    throw new Error('Invalid reset token purpose')
  }

  return decoded
}