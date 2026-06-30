import { createHash } from 'crypto'

import type { AuthSessionRepositoryContract } from '../../domain/repositories/auth-session.repository.interface'

export class LogoutUserUseCase {
  constructor(
    private readonly _authRepository: AuthSessionRepositoryContract
  ) {}

  async execute(refreshToken: string): Promise<void> {
    const refreshTokenHash = this.hashRefreshToken(refreshToken)

    await this._authRepository.revokeSessionByRefreshTokenHash(refreshTokenHash)
  }

  private hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex')
  }
}