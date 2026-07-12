import type { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface'

export class LogoutAllSessionsUseCase {
  constructor(
    private readonly _authRepository: IAuthSessionRepository
  ) {}

  async execute(userId: string): Promise<void> {
    await this._authRepository.revokeAllUserSessions(userId)
  }
}