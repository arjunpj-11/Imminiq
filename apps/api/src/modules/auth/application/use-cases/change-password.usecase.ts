import bcrypt from 'bcryptjs'

import type { AuthRepositoryContract } from '../../domain/repositories/auth.repository.interface'
import { ApiError } from '../../../../shared/utils/ApiError'

export class ChangePasswordUseCase {
  constructor(
    private readonly authRepository: AuthRepositoryContract
  ) {}

  async execute(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await this.authRepository.findById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    if (!user.passwordHash) {
      throw new ApiError(
        400,
        'OAuth accounts cannot change password',
        'OAUTH_ACCOUNT'
      )
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)

    if (!valid) {
      throw new ApiError(
        400,
        'Current password is incorrect',
        'WRONG_PASSWORD'
      )
    }

    await this.authRepository.updatePassword(userId, newPassword)
    await this.authRepository.revokeAllUserTokens(userId)
  }
}
