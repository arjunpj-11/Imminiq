import { authRepository } from '../../auth.repository'
import { ApiError } from '../../../../shared/utils/ApiError'
import { passwordResetSessionCache } from '../../../../infrastructure/cache/password-reset-session.cache'
import { securityAuditLogger } from '../../../../infrastructure/security/security-audit-logger'
import { verifyPasswordResetToken } from '../services/password-reset-token.service'

export class ResetPasswordUseCase {
  async execute(resetToken: string, newPassword: string) {
    const decoded = verifyPasswordResetToken(resetToken)

    const resetSessionUserId =
      await passwordResetSessionCache.consume(decoded.jti)

    if (resetSessionUserId !== decoded.userId) {
      await securityAuditLogger.record({
        userId: decoded.userId,
        eventType: 'PASSWORD_RESET_TOKEN_REPLAY_OR_EXPIRED',
        outcome: 'detected',
      })

      throw new ApiError(
        400,
        'Invalid or already-used reset token',
        'INVALID_RESET_TOKEN'
      )
    }

    const user = await authRepository.findById(decoded.userId)

    if (!user) {
      throw new ApiError(
        400,
        'Invalid or expired reset token',
        'INVALID_RESET_TOKEN'
      )
    }

    await authRepository.updatePassword(user._id.toString(), newPassword)
    await authRepository.revokeAllUserTokens(user._id.toString())

    await securityAuditLogger.record({
      userId: user._id.toString(),
      eventType: 'PASSWORD_RESET_COMPLETED',
      outcome: 'success',
    })
  }
}
