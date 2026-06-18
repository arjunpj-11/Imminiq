import type { AuthSessionRepositoryContract } from '../../domain/repositories/auth-session.repository.interface'

export class RevokeAuthSessionUseCase {
  constructor(
    private readonly authRepository: AuthSessionRepositoryContract
  ) {}

  async execute(userId: string, sessionId: string): Promise<void> {
    await this.authRepository.revokeSessionById(sessionId, userId)
  }
}
