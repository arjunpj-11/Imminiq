import type { SecuritySessionRepositoryContract } from '../../domain/repositories/security-session.repository.interface'
import type { SecurityTwoFactorRepositoryContract } from '../../domain/repositories/security-two-factor.repository.interface'
import type { SecurityUserRepositoryContract } from '../../domain/repositories/security-user.repository.interface'
import type { SecurityOverviewDto } from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'
import type { SecurityMapperContract } from '../mappers/security.mapper'
import type { CurrentSessionResolverContract } from '../services/current-session.service'

type SecurityOverviewRepository = SecurityUserRepositoryContract &
  SecuritySessionRepositoryContract &
  SecurityTwoFactorRepositoryContract

export class GetSecurityOverviewUseCase {
  constructor(
    private readonly _securityRepository: SecurityOverviewRepository,
    private readonly _currentSessionResolver: CurrentSessionResolverContract,
    private readonly _securityMapper: SecurityMapperContract,
  ) {}

  async execute(
    userId: string,
    refreshToken?: string,
  ): Promise<SecurityOverviewDto> {
    const user = await this._securityRepository.findUserById(userId)

    if (!user) {
      throw SecurityApplicationError.notFound()
    }

    const sessions = await this._securityRepository.findActiveSessions(userId)
    const currentSessionId =
      await this._currentSessionResolver.getCurrentSessionId(refreshToken)
    const twoFactor =
      await this._securityRepository.findTwoFactorByUserId(userId)

    return {
      email: user.email ?? '',
      emailVerified: user.emailVerified,
      pendingEmail: user.pendingEmail,
      authProvider: user.provider,
      canChangePassword: user.provider === 'local',
      twoFactorEnabled: twoFactor?.status === 'active',
      activeSessions: sessions.map((session) =>
        this._securityMapper.toSessionDto(session, currentSessionId),
      ),
      passwordLastChangedAt: null,
    }
  }
}
