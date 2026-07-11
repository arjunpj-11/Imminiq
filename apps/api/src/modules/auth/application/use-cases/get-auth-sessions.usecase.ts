import type { AuthSessionRepositoryContract } from '../../domain/repositories/auth-session.repository.interface'
import type { AuthSessionDto } from '../dtos/auth.dto'
import type { AuthSessionMapperContract } from '../mappers/auth-session.mapper'

export class GetAuthSessionsUseCase {
  constructor(
    private readonly _authRepository: AuthSessionRepositoryContract,
    private readonly _authSessionMapper: AuthSessionMapperContract,
  ) {}

  async execute(userId: string): Promise<AuthSessionDto[]> {
    const sessions = await this._authRepository.findAllUserSessions(userId)
    return sessions.map((session) => this._authSessionMapper.toDto(session))
  }
}
