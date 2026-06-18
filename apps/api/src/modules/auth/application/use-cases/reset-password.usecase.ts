import { AuthApplicationError } from '../errors/auth-application.error'
import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { AuthSessionRepositoryContract } from '../../domain/repositories/auth-session.repository.interface'
import type { PasswordResetSessionStoreContract } from '../../domain/services/password-reset-session-store.interface'
import type { PasswordResetTokenServiceContract } from '../../domain/services/password-reset-token.service.interface'
import type { SecurityAuditLoggerContract } from '../../domain/services/security-audit-logger.interface'
import type { PasswordHasherServiceContract } from '../../domain/services/password-hasher.service.interface'

type ResetPasswordRepository = AuthUserRepositoryContract & AuthSessionRepositoryContract

export class ResetPasswordUseCase {
  constructor(
    private readonly authRepository: ResetPasswordRepository,
    private readonly passwordResetTokenService: PasswordResetTokenServiceContract,
    private readonly passwordResetSessionStore: PasswordResetSessionStoreContract,
    private readonly securityAuditLogger: SecurityAuditLoggerContract,
    private readonly passwordHasher: PasswordHasherServiceContract
  ) {}

  async execute(resetToken: string, newPassword: string): Promise<void> {
    const decoded = this.passwordResetTokenService.verify(resetToken)

    const resetSessionUserId =
      await this.passwordResetSessionStore.consume(decoded.jti)

    if (resetSessionUserId !== decoded.userId) {
      await this.securityAuditLogger.record({
        userId: decoded.userId,
        eventType: 'PASSWORD_RESET_TOKEN_REPLAY_OR_EXPIRED',
        outcome: 'detected',
      })

      throw AuthApplicationError.invalidResetToken('Invalid or already-used reset token')
    }

    const user = await this.authRepository.findById(decoded.userId)

    if (!user) {
      throw AuthApplicationError.invalidResetToken('Invalid or expired reset token')
    }

    const passwordHash = await this.passwordHasher.hash(newPassword)

    await this.authRepository.updatePasswordHash(user.id, passwordHash)
    await this.authRepository.revokeAllUserTokens(user.id)

    await this.securityAuditLogger.record({
      userId: user.id,
      eventType: 'PASSWORD_RESET_COMPLETED',
      outcome: 'success',
    })
  }
}
