import { createHash } from 'crypto'

import type { AuthSessionRepositoryContract } from '../../domain/repositories/auth-session.repository.interface'
import type { AuthTokenServiceContract } from '../../domain/services/auth-token.service.interface'
import type { AuthRole } from '../../domain/value-objects/auth-role.vo'
import type { RequestMeta, TokenPair } from '../dtos/auth.dto'

export interface AuthSessionServiceContract {
  issueTokenPair(
    userId: string,
    role: AuthRole,
    meta?: RequestMeta
  ): Promise<TokenPair>
}

export class AuthSessionService implements AuthSessionServiceContract {
  constructor(
    private readonly _authSessionRepository: AuthSessionRepositoryContract,
    private readonly _authTokenService: AuthTokenServiceContract
  ) {}

  async issueTokenPair(
    userId: string,
    role: AuthRole,
    meta?: RequestMeta
  ): Promise<TokenPair> {
    const accessToken = this._authTokenService.generateAccessToken(userId, role)
    const refreshToken = this._authTokenService.generateRefreshToken()
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