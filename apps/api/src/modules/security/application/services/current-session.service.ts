import { createHash } from 'crypto'

import type { SecuritySessionRepositoryContract } from '../../domain/repositories/security-session.repository.interface'

export interface CurrentSessionServiceContract {
  getCurrentSessionId(refreshToken?: string): Promise<string | null>
}

export class CurrentSessionService implements CurrentSessionServiceContract {
  constructor(
    private readonly securitySessionRepository: SecuritySessionRepositoryContract,
  ) {}

  async getCurrentSessionId(refreshToken?: string): Promise<string | null> {
    if (!refreshToken) {
      return null
    }

    const refreshTokenHash = this.hashRefreshToken(refreshToken)

    const currentSession =
      await this.securitySessionRepository.findCurrentSessionByRefreshTokenHash(
        refreshTokenHash,
      )

    return currentSession?.id ?? null
  }

  private hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex')
  }
}