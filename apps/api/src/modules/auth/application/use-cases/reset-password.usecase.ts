import { authRepository } from '../../auth.repository'
import { ApiError } from '../../../../shared/utils/ApiError'
import { verifyPasswordResetToken } from '../services/password-reset-token.service'

export class ResetPasswordUseCase {
  async execute(resetToken: string, newPassword: string) {
    const decoded = verifyPasswordResetToken(resetToken)

    const user = await authRepository.findById(decoded.userId)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    await authRepository.updatePassword(user._id.toString(), newPassword)
    await authRepository.revokeAllUserTokens(user._id.toString())
  }
}
