import type { ISecuritySessionRepository } from '../../domain/repositories/security-session.repository.interface';
import type { IRefreshTokenHasher } from '../../../../shared/security/refresh-token-hasher.interface';

export interface ICurrentSessionResolver {
  getCurrentSessionId(
    refreshToken?: string,
    authenticatedSessionId?: string
  ): Promise<string | null>;
}

export class CurrentSessionResolver implements ICurrentSessionResolver {
  constructor(
    private readonly _securitySessionRepository: ISecuritySessionRepository,
    private readonly _refreshTokenHasher: IRefreshTokenHasher
  ) {}

  async getCurrentSessionId(
    refreshToken?: string,
    authenticatedSessionId?: string
  ): Promise<string | null> {
    if (authenticatedSessionId) {
      return authenticatedSessionId;
    }

    if (!refreshToken) {
      return null;
    }

    const refreshTokenHash = this._refreshTokenHasher.hash(refreshToken);

    const currentSession =
      await this._securitySessionRepository.findCurrentSessionByRefreshTokenHash(refreshTokenHash);

    return currentSession?.id ?? null;
  }
}
