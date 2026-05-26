import type { AuthRepositoryContract } from '../../domain/repositories/auth.repository.interface'

export class LogoutUserUseCase {
  constructor(
    private readonly authRepository: AuthRepositoryContract
  ) {}

  async execute(refreshToken: string) {
    await this.authRepository.revokeRefreshToken(refreshToken)
  }
}
