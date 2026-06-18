import type { SecuritySessionRepositoryContract } from '../../domain/repositories/security-session.repository.interface'
import type { SessionsResponseDto } from '../dtos/security.dto'
import type { SecurityMapperContract } from '../mappers/security.mapper'
import type { CurrentSessionServiceContract } from '../services/current-session.service'

export class GetSecuritySessionsUseCase {
  constructor(
    private readonly securitySessionRepository: SecuritySessionRepositoryContract,
    private readonly currentSessionService: CurrentSessionServiceContract,
    private readonly securityMapper: SecurityMapperContract,
  ) {}

  async execute(
    userId: string,
    refreshToken?: string,
  ): Promise<SessionsResponseDto> {
    const sessions =
      await this.securitySessionRepository.findActiveSessions(userId)
    const currentSessionId =
      await this.currentSessionService.getCurrentSessionId(refreshToken)

    return {
      activeSessions: sessions.map((session) =>
        this.securityMapper.toSessionDto(session, currentSessionId),
      ),
    }
  }
}
