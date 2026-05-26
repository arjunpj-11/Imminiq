import type { AuthRepositoryContract } from '../../domain/repositories/auth.repository.interface'

export class GetAuthSessionsUseCase {
  constructor(
    private readonly authRepository: AuthRepositoryContract
  ) {}

  async execute(userId: string) {
    return this.authRepository.findAllUserTokens(userId)
  }
}
