import { authRepository } from '../../auth.repository'

export class LogoutAllSessionsUseCase {
  async execute(userId: string) {
    await authRepository.revokeAllUserTokens(userId)
  }
}
