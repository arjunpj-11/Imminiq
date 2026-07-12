import type { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface'
import type { IAuthSessionDTO } from '../dtos/auth.dto'
import type { IAuthSessionMapper } from '../mappers/auth-session.mapper'

export class GetAuthSessionsUseCase {
  constructor(
    private readonly _authRepository: IAuthSessionRepository,
    private readonly _authSessionMapper: IAuthSessionMapper,
  ) {}

  async execute(userId: string): Promise<IAuthSessionDTO[]> {
    const sessions = await this._authRepository.findAllUserSessions(userId)
    return sessions.map((session) => this._authSessionMapper.toDto(session))
  }
}
