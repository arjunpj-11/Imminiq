import { createHash } from 'crypto'

import type { SecuritySessionRepositoryContract } from '../../domain/repositories/security-session.repository.interface'

export interface CurrentSessionResolverContract {
  getCurrentSessionId(refreshToken?: string): Promise<string | null>
}

export class CurrentSessionResolver implements CurrentSessionResolverContract {
  constructor(
    private readonly _securitySessionRepository: SecuritySessionRepositoryContract,
  ) {}

  async getCurrentSessionId(refreshToken?: string): Promise<string | null> {
    if (!refreshToken) {
      return null
    }

    const refreshTokenHash = this.hashRefreshToken(refreshToken)

    const currentSession =
      await this._securitySessionRepository.findCurrentSessionByRefreshTokenHash(
        refreshTokenHash,
      )

    return currentSession?.id ?? null
  }

  private hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex')
  }
}