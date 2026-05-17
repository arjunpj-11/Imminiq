import { authRepository } from '../../auth.repository'

export class LogoutUserUseCase {
  async execute(refreshToken: string) {
    await authRepository.revokeRefreshToken(refreshToken)
  }
}
