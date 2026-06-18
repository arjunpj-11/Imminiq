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

    const currentSession =
      await this.securitySessionRepository.findCurrentRefreshTokenSession(
        refreshToken,
      )

    return currentSession?.id ?? null
  }
}
