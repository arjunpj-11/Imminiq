import { AuthApplicationError } from '../errors/auth-application.error'
import type { AuthSessionRepositoryContract } from '../../domain/repositories/auth-session.repository.interface'
import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { PasswordHasherContract } from '../../domain/services/password-hasher.interface'
import type { PasswordResetSessionStoreContract } from '../../domain/services/password-reset-session-store.interface'
import type { PasswordResetTokenContract } from '../../domain/services/password-reset-token.interface'
import type { SecurityAuditLoggerContract } from '../../domain/services/security-audit-logger.interface'

type ResetPasswordRepository =
  AuthUserRepositoryContract & AuthSessionRepositoryContract

export class ResetPasswordUseCase {
  constructor(
    private readonly _authRepository: ResetPasswordRepository,
    private readonly _passwordResetToken: PasswordResetTokenContract,
    private readonly _passwordResetSessionStore: PasswordResetSessionStoreContract,
    private readonly _securityAuditLogger: SecurityAuditLoggerContract,
    private readonly _passwordHasher: PasswordHasherContract
  ) {}

  async execute(resetToken: string, newPassword: string): Promise<void> {
    const decoded = this._passwordResetToken.verify(resetToken)

    const resetSessionUserId =
      await this._passwordResetSessionStore.consume(decoded.jti)

    if (resetSessionUserId !== decoded.userId) {
      await this._securityAuditLogger.record({
        userId: decoded.userId,
        eventType: 'PASSWORD_RESET_TOKEN_REPLAY_OR_EXPIRED',
        outcome: 'detected',
      })

      throw AuthApplicationError.invalidResetToken(
        'Invalid or already-used reset token'
      )
    }

    const user = await this._authRepository.findById(decoded.userId)

    if (!user) {
      throw AuthApplicationError.invalidResetToken(
        'Invalid or expired reset token'
      )
    }

    const passwordHash = await this._passwordHasher.hash(newPassword)

    await this._authRepository.updatePasswordHash(user.id, passwordHash)
    await this._authRepository.revokeAllUserSessions(user.id)

    await this._securityAuditLogger.record({
      userId: user.id,
      eventType: 'PASSWORD_RESET_COMPLETED',
      outcome: 'success',
    })
  }
}