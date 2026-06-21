import type { AuthSessionRepositoryContract } from '../../domain/repositories/auth-session.repository.interface'

export class LogoutAllSessionsUseCase {
  constructor(
    private readonly authRepository: AuthSessionRepositoryContract
  ) {}

  async execute(userId: string): Promise<void> {
    await this.authRepository.revokeAllUserSessions(userId)
  }
}