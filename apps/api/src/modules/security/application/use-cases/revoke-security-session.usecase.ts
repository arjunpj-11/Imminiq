import type { SecuritySessionRepositoryContract } from '../../domain/repositories/security-session.repository.interface'
import type { RevokeSessionResponseDto } from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'
import type { CurrentSessionServiceContract } from '../services/current-session.service'

export class RevokeSecuritySessionUseCase {
  constructor(
    private readonly securitySessionRepository: SecuritySessionRepositoryContract,
    private readonly currentSessionService: CurrentSessionServiceContract,
  ) {}

  async execute(
    userId: string,
    sessionId: string,
    refreshToken?: string,
  ): Promise<RevokeSessionResponseDto> {
    const currentSessionId =
      await this.currentSessionService.getCurrentSessionId(refreshToken)

    if (currentSessionId === sessionId) {
      throw SecurityApplicationError.cannotRevokeCurrentSession()
    }

    const revokedSession =
      await this.securitySessionRepository.revokeSessionById(userId, sessionId)

    if (!revokedSession) {
      throw SecurityApplicationError.sessionNotFound()
    }

    return { revoked: true, sessionId }
  }
}
