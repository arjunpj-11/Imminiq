import crypto from 'crypto'
import jwt, { SignOptions } from 'jsonwebtoken'

import { env } from '../../../../config/env'
import { AuthDomainError } from '../../domain/errors/auth-domain.error'
import type { AuthTokenServiceContract } from '../../domain/services/auth-token.service.interface'
import type { AuthRole } from '../../domain/value-objects/auth-role.vo'
import type {
  JwtPayload,
  TwoFactorChallengeTokenPayload,
} from '../../domain/value-objects/token-payload.vo'
import { TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES } from '../../domain/constants/auth.constants'

export class JwtAuthTokenService implements AuthTokenServiceContract {
  generateAccessToken(userId: string, role: AuthRole): string {
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

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex')
  }

  generateTwoFactorChallengeToken(userId: string): string {
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

  verifyTwoFactorChallengeToken(
    challengeToken: string
  ): TwoFactorChallengeTokenPayload {
    let decoded: TwoFactorChallengeTokenPayload

    try {
      decoded = jwt.verify(
        challengeToken,
        env.JWT_SECRET
      ) as TwoFactorChallengeTokenPayload
    } catch {
      throw new AuthDomainError(
        'TWO_FACTOR_CHALLENGE_EXPIRED',
        'Two-factor challenge expired. Please sign in again.'
      )
    }

    if (decoded.purpose !== 'two_factor_login') {
      throw new AuthDomainError(
        'INVALID_TWO_FACTOR_CHALLENGE',
        'Invalid two-factor challenge'
      )
    }

    return decoded
  }
}

export const jwtAuthTokenService = new JwtAuthTokenService()
