import { authRepository } from '../../auth.repository'

export class CheckUsernameUseCase {
  async execute(username: string) {
    const exists = await authRepository.usernameExists(username)

    return { available: !exists }
  }
}
