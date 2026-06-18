import type { AuthSessionRepositoryContract } from '../../domain/repositories/auth-session.repository.interface'

export class LogoutUserUseCase {
  constructor(
    private readonly authRepository: AuthSessionRepositoryContract
  ) {}

  async execute(refreshToken: string): Promise<void> {
    await this.authRepository.revokeRefreshToken(refreshToken)
  }
}
