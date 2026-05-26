import type { AuthRepositoryContract } from '../../domain/repositories/auth.repository.interface'

export class RevokeAuthSessionUseCase {
  constructor(
    private readonly authRepository: AuthRepositoryContract
  ) {}

  async execute(userId: string, sessionId: string) {
    await this.authRepository.revokeSessionById(sessionId, userId)
  }
}
