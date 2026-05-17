import { ApiError } from '../../../../shared/utils/ApiError'
import type { SecurityRepository } from '../../domain/repositories/security.repository.interface'
import type { SecurityOverview } from '../../domain/types/security.types'
import { getCurrentSessionId } from '../helpers/current-session.helper'
import { mapSession } from '../utils/security-session.util'

export class GetSecurityOverviewUseCase {
  constructor(
    private readonly securityRepository: SecurityRepository
  ) {}

  async execute(
    userId: string,
    refreshToken?: string
  ): Promise<SecurityOverview> {
    const user = await this.securityRepository.findUserById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    const sessions = await this.securityRepository.findActiveSessions(userId)
    const currentSessionId = await getCurrentSessionId(
      this.securityRepository,
      refreshToken
    )
    const twoFactor = await this.securityRepository.findTwoFactorByUserId(
      userId
    )

    return {
      email: user.email ?? '',
      emailVerified: user.emailVerified,
      pendingEmail: user.pendingEmail ?? null,

      authProvider: user.provider,
      canChangePassword: user.provider === 'local',

      twoFactorEnabled: twoFactor?.status === 'active',
      activeSessions: sessions.map((session) =>
        mapSession(session, currentSessionId)
      ),
      passwordLastChangedAt: null,
    }
  }
}
