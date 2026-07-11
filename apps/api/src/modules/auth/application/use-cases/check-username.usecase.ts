import type { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface'

export class CheckUsernameUseCase {
  constructor(
    private readonly _authRepository: IAuthUserRepository
  ) {}

  async execute(username: string): Promise<{ available: boolean }> {
    const exists = await this._authRepository.usernameExists(username)

    return { available: !exists }
  }
}
