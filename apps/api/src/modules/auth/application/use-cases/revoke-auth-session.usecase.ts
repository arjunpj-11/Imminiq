import type { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface'

export interface IRevokeAuthSessionUseCase {
  execute(userId: string, sessionId: string): Promise<void>
}

export class RevokeAuthSessionUseCase implements IRevokeAuthSessionUseCase {
  constructor(
    private readonly _authRepository: IAuthSessionRepository
  ) {}

  async execute(userId: string, sessionId: string): Promise<void> {
    await this._authRepository.revokeSessionById(sessionId, userId)
  }
}
