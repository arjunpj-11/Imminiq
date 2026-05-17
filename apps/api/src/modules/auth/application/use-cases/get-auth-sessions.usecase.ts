import { authRepository } from '../../auth.repository'

export class GetAuthSessionsUseCase {
  async execute(userId: string) {
    return authRepository.findAllUserTokens(userId)
  }
}
