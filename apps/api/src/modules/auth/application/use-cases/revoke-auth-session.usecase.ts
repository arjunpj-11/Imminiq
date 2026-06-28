import type { AuthSessionRepositoryContract } from '../../domain/repositories/auth-session.repository.interface'

export class RevokeAuthSessionUseCase {
  constructor(
    private readonly _authRepository: AuthSessionRepositoryContract
  ) {}

  async execute(userId: string, sessionId: string): Promise<void> {
    await this._authRepository.revokeSessionById(sessionId, userId)
  }
}
