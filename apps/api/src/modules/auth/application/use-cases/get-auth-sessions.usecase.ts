import type { AuthSessionEntity } from '../../domain/entities/auth-session.entity'
import type { AuthSessionRepositoryContract } from '../../domain/repositories/auth-session.repository.interface'

export class GetAuthSessionsUseCase {
  constructor(
    private readonly authRepository: AuthSessionRepositoryContract
  ) {}

  async execute(userId: string): Promise<AuthSessionEntity[]> {
    return this.authRepository.findAllUserTokens(userId)
  }
}
