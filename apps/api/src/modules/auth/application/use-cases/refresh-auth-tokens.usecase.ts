import { createHash } from 'crypto'

import { AuthApplicationError } from '../errors/auth-application.error'
import type { AuthSessionRepositoryContract } from '../../domain/repositories/auth-session.repository.interface'
import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { AuthTokenServiceContract } from '../../domain/services/auth-token.service.interface'
import type { RetiredRefreshTokenStoreContract } from '../../domain/services/retired-refresh-token-store.interface'
import type { SecurityAuditLoggerContract } from '../../domain/services/security-audit-logger.interface'
import type { RequestMeta, TokenPair } from '../dtos/auth.dto'
import type { AuthAccountPolicyContract } from '../policies/auth-account-policy.policy'

type RefreshTokensRepository =
  AuthUserRepositoryContract & AuthSessionRepositoryContract

export class RefreshAuthTokensUseCase {
  constructor(
    private readonly _authRepository: RefreshTokensRepository,
    private readonly _authTokenService: AuthTokenServiceContract,
    private readonly _retiredRefreshTokenStore: RetiredRefreshTokenStoreContract,
    private readonly _securityAuditLogger: SecurityAuditLoggerContract,
    private readonly _authAccountPolicy: AuthAccountPolicyContract
  ) {}

  async execute(refreshToken: string, meta?: RequestMeta): Promise<TokenPair> {
    const refreshTokenHash = this.hashRefreshToken(refreshToken)

    const tokenRecord =
      await this._authRepository.findSessionByRefreshTokenHash(refreshTokenHash)

    if (!tokenRecord) {
      const retired =
        await this._retiredRefreshTokenStore.findByRawToken(refreshToken)

      if (retired) {
        await this._authRepository.revokeAllUserSessions(retired.userId)

        await this._securityAuditLogger.record({
          userId: retired.userId,
          eventType: 'REFRESH_TOKEN_REUSE_DETECTED',
          outcome: 'detected',
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
          metadata: {
            sessionId: retired.sessionId,
          },
        })

        throw AuthApplicationError.refreshTokenReuseDetected(
          'Refresh token reuse detected. Please sign in again.'
        )
      }

      throw AuthApplicationError.unauthorized('Invalid refresh token')
    }

    const user = await this._authRepository.findById(tokenRecord.userId)

    if (!user) {
      throw AuthApplicationError.unauthorized('User not found')
    }

    this._authAccountPolicy.ensureUserCanAuthenticate(user)

    const accessToken = this._authTokenService.generateAccessToken(
      user.id,
      user.role
    )

    const newRefreshToken = this._authTokenService.generateRefreshToken()
    const newRefreshTokenHash = this.hashRefreshToken(newRefreshToken)

  await this._retiredRefreshTokenStore.retire({
  refreshTokenHash,
  userId: tokenRecord.userId,
  sessionId: tokenRecord.id,
  expiresAt: tokenRecord.expiresAt,
})

    const rotatedSession =
      await this._authRepository.rotateRefreshTokenInSameSession({
        sessionId: tokenRecord.id,
        newRefreshTokenHash,
        meta,
      })

    if (!rotatedSession) {
      throw AuthApplicationError.sessionRefreshFailed(
        'Unable to refresh session'
      )
    }

    return {
      accessToken,
      refreshToken: newRefreshToken,
    }
  }

  private hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex')
  }
}