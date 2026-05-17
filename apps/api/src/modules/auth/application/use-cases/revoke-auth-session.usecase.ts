import { authRepository } from '../../auth.repository'

export class RevokeAuthSessionUseCase {
  async execute(userId: string, sessionId: string) {
    await authRepository.revokeSessionById(sessionId, userId)
  }
}
