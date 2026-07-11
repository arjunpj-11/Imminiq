import { createHash } from 'crypto'

import type { ISecuritySessionRepository } from '../../domain/repositories/security-session.repository.interface'

export interface ICurrentSessionResolver {
  getCurrentSessionId(refreshToken?: string): Promise<string | null>
}

export class CurrentSessionResolver implements ICurrentSessionResolver {
  constructor(
    private readonly _securitySessionRepository: ISecuritySessionRepository,
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