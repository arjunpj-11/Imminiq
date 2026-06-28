import type { AuthSessionRepositoryContract } from '../../domain/repositories/auth-session.repository.interface'

export class LogoutAllSessionsUseCase {
  constructor(
    private readonly _authRepository: AuthSessionRepositoryContract
  ) {}

  async execute(userId: string): Promise<void> {
    await this._authRepository.revokeAllUserSessions(userId)
  }
}