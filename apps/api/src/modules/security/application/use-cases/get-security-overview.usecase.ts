import type { SecuritySessionRepositoryContract } from '../../domain/repositories/security-session.repository.interface'
import type { SecurityTwoFactorRepositoryContract } from '../../domain/repositories/security-two-factor.repository.interface'
import type { SecurityUserRepositoryContract } from '../../domain/repositories/security-user.repository.interface'
import type { SecurityOverviewDto } from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'
import type { SecurityMapperContract } from '../mappers/security.mapper'
import type { CurrentSessionServiceContract } from '../services/current-session.service'

type SecurityOverviewRepository = SecurityUserRepositoryContract &
  SecuritySessionRepositoryContract &
  SecurityTwoFactorRepositoryContract

export class GetSecurityOverviewUseCase {
  constructor(
    private readonly securityRepository: SecurityOverviewRepository,
    private readonly currentSessionService: CurrentSessionServiceContract,
    private readonly securityMapper: SecurityMapperContract,
  ) {}

  async execute(
    userId: string,
    refreshToken?: string,
  ): Promise<SecurityOverviewDto> {
    const user = await this.securityRepository.findUserById(userId)

    if (!user) {
      throw SecurityApplicationError.notFound()
    }

    const sessions = await this.securityRepository.findActiveSessions(userId)
    const currentSessionId =
      await this.currentSessionService.getCurrentSessionId(refreshToken)
    const twoFactor =
      await this.securityRepository.findTwoFactorByUserId(userId)

    return {
      email: user.email ?? '',
      emailVerified: user.emailVerified,
      pendingEmail: user.pendingEmail,
      authProvider: user.provider,
      canChangePassword: user.provider === 'local',
      twoFactorEnabled: twoFactor?.status === 'active',
      activeSessions: sessions.map((session) =>
        this.securityMapper.toSessionDto(session, currentSessionId),
      ),
      passwordLastChangedAt: null,
    }
  }
}
