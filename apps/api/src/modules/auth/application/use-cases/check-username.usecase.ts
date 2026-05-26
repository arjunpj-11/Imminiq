import type { AuthRepositoryContract } from '../../domain/repositories/auth.repository.interface'

export class CheckUsernameUseCase {
  constructor(
    private readonly authRepository: AuthRepositoryContract
  ) {}

  async execute(username: string) {
    const exists = await this.authRepository.usernameExists(username)

    return { available: !exists }
  }
}
