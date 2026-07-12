import { createHash } from 'crypto'

import type { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface'
import type { IAuthToken } from '../../domain/services/auth-token.interface'
import type { AuthRole } from '../../domain/value-objects/auth-role.vo'
import type { RequestMetaDTO, ITokenPairDTO } from '../auth.dto'

export interface IAuthSessionIssuer {
  issueTokenPair(
    userId: string,
    role: AuthRole,
    meta?: RequestMetaDTO
  ): Promise<ITokenPairDTO>
}

export class AuthSessionIssuer implements IAuthSessionIssuer {
  constructor(
    private readonly _authSessionRepository: IAuthSessionRepository,
    private readonly _authToken: IAuthToken
  ) {}

  async issueTokenPair(
    userId: string,
    role: AuthRole,
    meta?: RequestMetaDTO
  ): Promise<ITokenPairDTO> {
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