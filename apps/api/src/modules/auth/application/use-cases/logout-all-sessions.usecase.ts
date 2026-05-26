import type { AuthRepositoryContract } from '../../domain/repositories/auth.repository.interface'

export class LogoutAllSessionsUseCase {
  constructor(
    private readonly authRepository: AuthRepositoryContract
  ) {}

  async execute(userId: string) {
    await this.authRepository.revokeAllUserTokens(userId)
  }
}
