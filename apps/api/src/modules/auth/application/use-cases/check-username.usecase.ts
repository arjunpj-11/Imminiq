import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'

export class CheckUsernameUseCase {
  constructor(
    private readonly authRepository: AuthUserRepositoryContract
  ) {}

  async execute(username: string): Promise<{ available: boolean }> {
    const exists = await this.authRepository.usernameExists(username)

    return { available: !exists }
  }
}
