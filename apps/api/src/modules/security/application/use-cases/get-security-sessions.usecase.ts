import type { ISecuritySessionRepository } from '../../domain/repositories/security-session.repository.interface'
import type { ISessionsResponseDTO } from '../dtos/security.dto'
import type { ISecurityMapper } from '../mappers/security.mapper'
import type { ICurrentSessionResolver } from '../services/current-session.service'

export class GetSecuritySessionsUseCase {
  constructor(
    private readonly _securitySessionRepository: ISecuritySessionRepository,
    private readonly _currentSessionResolver: ICurrentSessionResolver,
    private readonly _securityMapper: ISecurityMapper,
  ) {}

  async execute(
    userId: string,
    refreshToken?: string,
  ): Promise<ISessionsResponseDTO> {
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
