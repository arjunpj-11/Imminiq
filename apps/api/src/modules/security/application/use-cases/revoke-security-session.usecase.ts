import type { SecuritySessionRepositoryContract } from '../../domain/repositories/security-session.repository.interface'
import type { RevokeSessionResponseDto } from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'
import type { CurrentSessionResolverContract } from '../services/current-session.service'

export class RevokeSecuritySessionUseCase {
  constructor(
    private readonly _securitySessionRepository: SecuritySessionRepositoryContract,
    private readonly _currentSessionResolver: CurrentSessionResolverContract,
  ) {}

  async execute(
    userId: string,
    sessionId: string,
    refreshToken?: string,
  ): Promise<RevokeSessionResponseDto> {
    const currentSessionId =
      await this._currentSessionResolver.getCurrentSessionId(refreshToken)

    if (currentSessionId === sessionId) {
      throw SecurityApplicationError.cannotRevokeCurrentSession()
    }

    const revokedSession =
      await this._securitySessionRepository.revokeSessionById({
        userId,
        sessionId,
      })

    if (!revokedSession) {
      throw SecurityApplicationError.sessionNotFound()
    }

    return { revoked: true, sessionId }
  }
}