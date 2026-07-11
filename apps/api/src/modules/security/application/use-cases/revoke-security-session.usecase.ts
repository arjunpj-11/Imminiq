import type { ISecuritySessionRepository } from '../../domain/repositories/security-session.repository.interface'
import type { IRevokeSessionResponseDTO } from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'
import type { ICurrentSessionResolver } from '../services/current-session.service'

export class RevokeSecuritySessionUseCase {
  constructor(
    private readonly _securitySessionRepository: ISecuritySessionRepository,
    private readonly _currentSessionResolver: ICurrentSessionResolver,
  ) {}

  async execute(
    userId: string,
    sessionId: string,
    refreshToken?: string,
  ): Promise<IRevokeSessionResponseDTO> {
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