import type { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface'

export class RevokeAuthSessionUseCase {
  constructor(
    private readonly _authRepository: IAuthSessionRepository
  ) {}

  async execute(userId: string, sessionId: string): Promise<void> {
    await this._authRepository.revokeSessionById(sessionId, userId)
  }
}
