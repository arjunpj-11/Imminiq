import type { SecurityRepository } from '../../domain/repositories/security.repository.interface'
import type { SessionsResponse } from '../../domain/types/security.types'
import { getCurrentSessionId } from '../helpers/current-session.helper'
import { mapSession } from '../utils/security-session.util'

export class GetSecuritySessionsUseCase {
  constructor(
    private readonly securityRepository: SecurityRepository
  ) {}

  async execute(
    userId: string,
    refreshToken?: string
  ): Promise<SessionsResponse> {
    const sessions = await this.securityRepository.findActiveSessions(userId)
    const currentSessionId = await getCurrentSessionId(
      this.securityRepository,
      refreshToken
    )

    return {
      activeSessions: sessions.map((session) =>
        mapSession(session, currentSessionId)
      ),
    }
  }
}
