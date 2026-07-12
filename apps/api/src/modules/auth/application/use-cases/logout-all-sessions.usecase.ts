import type { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface'

export interface ILogoutAllSessionsUseCase {
  execute(userId: string): Promise<void>
}

export class LogoutAllSessionsUseCase implements ILogoutAllSessionsUseCase {
  constructor(
    private readonly _authRepository: IAuthSessionRepository
  ) {}

  async execute(userId: string): Promise<void> {
    await this._authRepository.revokeAllUserSessions(userId)
  }
}