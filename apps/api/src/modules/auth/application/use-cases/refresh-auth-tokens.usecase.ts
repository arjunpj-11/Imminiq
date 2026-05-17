import { authRepository } from '../../auth.repository'
import { ApiError } from '../../../../shared/utils/ApiError'
import { retiredRefreshTokenCache } from '../../../../infrastructure/cache/retired-refresh-token.cache'
import { securityAuditLogger } from '../../../../infrastructure/security/security-audit-logger'
import type {
  RequestMeta,
  TokenPair,
} from '../../domain/types/auth.types'
import { ensureUserCanAuthenticate } from '../services/auth-account-policy.service'
import {
  generateAccessToken,
  generateRefreshToken,
} from '../services/auth-token.service'

export class RefreshAuthTokensUseCase {
  async execute(
    refreshToken: string,
    meta?: RequestMeta
  ): Promise<TokenPair> {
    const tokenRecord = await authRepository.findRefreshToken(refreshToken)

    if (!tokenRecord) {
      const retired =
        await retiredRefreshTokenCache.findByRawToken(refreshToken)

      if (retired) {
        await authRepository.revokeAllUserTokens(retired.userId)

        await securityAuditLogger.record({
          userId: retired.userId,
          eventType: 'REFRESH_TOKEN_REUSE_DETECTED',
          outcome: 'detected',
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
          metadata: {
            sessionId: retired.sessionId,
          },
        })

        throw new ApiError(
          401,
          'Refresh token reuse detected. Please sign in again.',
          'REFRESH_TOKEN_REUSE_DETECTED'
        )
      }

      throw new ApiError(401, 'Invalid refresh token', 'UNAUTHORIZED')
    }

    const user = await authRepository.findById(tokenRecord.userId.toString())

    if (!user) {
      throw new ApiError(401, 'User not found', 'UNAUTHORIZED')
    }

    ensureUserCanAuthenticate(user)

    const accessToken = generateAccessToken(
      user._id.toString(),
      user.role
    )

    const newRefreshToken = generateRefreshToken()

    await retiredRefreshTokenCache.retire({
      refreshTokenHash: tokenRecord.refreshTokenHash,
      userId: tokenRecord.userId.toString(),
      sessionId: tokenRecord._id.toString(),
      expiresAt: tokenRecord.expiresAt,
    })

    const rotatedSession =
      await authRepository.rotateRefreshTokenInSameSession(
        tokenRecord._id.toString(),
        newRefreshToken,
        meta
      )

    if (!rotatedSession) {
      throw new ApiError(
        401,
        'Unable to refresh session',
        'SESSION_REFRESH_FAILED'
      )
    }

    return {
      accessToken,
      refreshToken: newRefreshToken,
    }
  }
}
