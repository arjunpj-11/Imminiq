import crypto from 'crypto'
import jwt, { SignOptions } from 'jsonwebtoken'

import { env } from '../../../../config/env'
import { authRepository } from '../../auth.repository'
import type {
  AuthRole,
  JwtPayload,
  RequestMeta,
  TokenPair,
  TwoFactorChallengeTokenPayload,
} from '../../domain/types/auth.types'
import { ApiError } from '../../../../shared/utils/ApiError'

export const TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES = 5

export const generateAccessToken = (
  userId: string,
  role: AuthRole
): string => {
  const accessTokenOptions: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  }

  return jwt.sign(
    {
      userId,
      role,
      type: 'access',
    } as JwtPayload,
    env.JWT_SECRET,
    accessTokenOptions
  )
}

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString('hex')
}

export const issueTokenPair = async (
  userId: string,
  role: AuthRole,
  meta?: RequestMeta
): Promise<TokenPair> => {
  const accessToken = generateAccessToken(userId, role)
  const refreshToken = generateRefreshToken()

  await authRepository.saveRefreshToken({
    userId,
    refreshToken,
    device: meta?.device,
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  })

  return {
    accessToken,
    refreshToken,
  }
}

export const generateTwoFactorChallengeToken = (userId: string) => {
  const challengeOptions: SignOptions = {
    expiresIn: `${TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES}m`,
  }

  return jwt.sign(
    {
      userId,
      purpose: 'two_factor_login',
    },
    env.JWT_SECRET,
    challengeOptions
  )
}

export const verifyTwoFactorChallengeToken = (
  challengeToken: string
): TwoFactorChallengeTokenPayload => {
  let decoded: TwoFactorChallengeTokenPayload

  try {
    decoded = jwt.verify(
      challengeToken,
      env.JWT_SECRET
    ) as TwoFactorChallengeTokenPayload
  } catch {
    throw new ApiError(
      401,
      'Two-factor challenge expired. Please sign in again.',
      'TWO_FACTOR_CHALLENGE_EXPIRED'
    )
  }

  if (decoded.purpose !== 'two_factor_login') {
    throw new ApiError(
      401,
      'Invalid two-factor challenge',
      'INVALID_TWO_FACTOR_CHALLENGE'
    )
  }

  return decoded
}
