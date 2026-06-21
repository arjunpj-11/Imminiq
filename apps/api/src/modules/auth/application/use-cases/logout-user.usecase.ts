import { createHash } from 'crypto'

import type { AuthSessionRepositoryContract } from '../../domain/repositories/auth-session.repository.interface'

export class LogoutUserUseCase {
  constructor(
    private readonly authRepository: AuthSessionRepositoryContract
  ) {}

  async execute(refreshToken: string): Promise<void> {
    const refreshTokenHash = this.hashRefreshToken(refreshToken)

    await this.authRepository.revokeSessionByRefreshTokenHash(refreshTokenHash)
  }

  private hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex')
  }
}