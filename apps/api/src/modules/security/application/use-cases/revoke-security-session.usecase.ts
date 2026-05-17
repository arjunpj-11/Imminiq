import { ApiError } from '../../../../shared/utils/ApiError'
import type { SecurityRepository } from '../../domain/repositories/security.repository.interface'
import type { RevokeSessionResponse } from '../../domain/types/security.types'
import { getCurrentSessionId } from '../helpers/current-session.helper'

export class RevokeSecuritySessionUseCase {
  constructor(
    private readonly securityRepository: SecurityRepository
  ) {}

  async execute(
    userId: string,
    sessionId: string,
    refreshToken?: string
  ): Promise<RevokeSessionResponse> {
    const currentSessionId = await getCurrentSessionId(
      this.securityRepository,
      refreshToken
    )

    if (currentSessionId === sessionId) {
      throw new ApiError(
        403,
        'Use logout to end your current session',
        'CANNOT_REVOKE_CURRENT_SESSION'
      )
    }

    const revokedSession =
      await this.securityRepository.revokeSessionById(userId, sessionId)

    if (!revokedSession) {
      throw new ApiError(
        404,
        'Session not found',
        'SESSION_NOT_FOUND'
      )
    }

    return {
      revoked: true,
      sessionId,
    }
  }
}
