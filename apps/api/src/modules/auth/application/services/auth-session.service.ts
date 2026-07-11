import { createHash } from 'crypto'

import type { AuthSessionRepositoryContract } from '../../domain/repositories/auth-session.repository.interface'
import type { AuthTokenContract } from '../../domain/services/auth-token.interface'
import type { AuthRole } from '../../domain/value-objects/auth-role.vo'
import type { RequestMeta, TokenPair } from '../dtos/auth.dto'

export interface AuthSessionIssuerContract {
  issueTokenPair(
    userId: string,
    role: AuthRole,
    meta?: RequestMeta
  ): Promise<TokenPair>
}

export class AuthSessionIssuer implements AuthSessionIssuerContract {
  constructor(
    private readonly _authSessionRepository: AuthSessionRepositoryContract,
    private readonly _authToken: AuthTokenContract
  ) {}

  async issueTokenPair(
    userId: string,
    role: AuthRole,
    meta?: RequestMeta
  ): Promise<TokenPair> {
    const accessToken = this._authToken.generateAccessToken(userId, role)
    const refreshToken = this._authToken.generateRefreshToken()
    const refreshTokenHash = this.hashRefreshToken(refreshToken)

    await this._authSessionRepository.saveSession({
      userId,
      refreshTokenHash,
      device: meta?.device,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  private hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex')
  }
}