import { AuthApplicationError } from '../errors/auth-application.error'
import type { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface'
import type { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface'
import type { IPasswordHasher } from '../../domain/services/password-hasher.interface'
import type { IPasswordResetSessionStore } from '../../domain/services/password-reset-session-store.interface'
import type { IPasswordResetToken } from '../../domain/services/password-reset-token.interface'
import type { ISecurityAuditLogger } from '../../domain/services/security-audit-logger.interface'

type ResetPasswordRepository =
  IAuthUserRepository & IAuthSessionRepository

export class ResetPasswordUseCase {
  constructor(
    private readonly _authRepository: ResetPasswordRepository,
    private readonly _passwordResetToken: IPasswordResetToken,
    private readonly _passwordResetSessionStore: IPasswordResetSessionStore,
    private readonly _securityAuditLogger: ISecurityAuditLogger,
    private readonly _passwordHasher: IPasswordHasher
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