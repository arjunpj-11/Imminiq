import type { SecuritySessionRepositoryContract } from '../../domain/repositories/security-session.repository.interface'
import type { SessionsResponseDto } from '../dtos/security.dto'
import type { SecurityMapperContract } from '../mappers/security.mapper'
import type { CurrentSessionResolverContract } from '../services/current-session.service'

export class GetSecuritySessionsUseCase {
  constructor(
    private readonly _securitySessionRepository: SecuritySessionRepositoryContract,
    private readonly _currentSessionResolver: CurrentSessionResolverContract,
    private readonly _securityMapper: SecurityMapperContract,
  ) {}

  async execute(
    userId: string,
    refreshToken?: string,
  ): Promise<SessionsResponseDto> {
    const sessions =
      await this._securitySessionRepository.findActiveSessions(userId)
    const currentSessionId =
      await this._currentSessionResolver.getCurrentSessionId(refreshToken)

    return {
      activeSessions: sessions.map((session) =>
        this._securityMapper.toSessionDto(session, currentSessionId),
      ),
    }
  }
}
