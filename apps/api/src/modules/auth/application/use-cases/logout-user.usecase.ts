import { createHash } from 'crypto'

import type { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface'

export interface ILogoutUserUseCase {
  execute(refreshToken: string): Promise<void>
}

export class LogoutUserUseCase implements ILogoutUserUseCase {
  constructor(
    private readonly _authRepository: IAuthSessionRepository
  ) {}

  async execute(refreshToken: string): Promise<void> {
    const refreshTokenHash = this.hashRefreshToken(refreshToken)

    await this._authRepository.revokeSessionByRefreshTokenHash(refreshTokenHash)
  }

  private hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex')
  }
}