import { AuthApplicationError } from '../auth-application.error';
import type { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface';
import type { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import type { IPasswordHasher } from '../../domain/services/password-hasher.interface';
import type { IPasswordResetSessionStore } from '../../domain/services/password-reset-session-store.interface';
import type { IPasswordResetToken } from '../../domain/services/password-reset-token.interface';
import type { IAuthSecurityAuditLogger } from '../../domain/services/security-audit-logger.interface';

type ResetPasswordRepository = Pick<IAuthUserRepository, 'findById' | 'updatePasswordHash'> &
  Pick<IAuthSessionRepository, 'revokeAllUserSessions'>;

export interface IResetPasswordUseCase {
  execute(resetToken: string, newPassword: string): Promise<void>;
}

export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    private readonly _authRepository: ResetPasswordRepository,
    private readonly _passwordResetToken: IPasswordResetToken,
    private readonly _passwordResetSessionStore: IPasswordResetSessionStore,
    private readonly _authSecurityAuditLogger: IAuthSecurityAuditLogger,
    private readonly _passwordHasher: IPasswordHasher
  ) {}

  async execute(resetToken: string, newPassword: string): Promise<void> {
    const decoded = this._passwordResetToken.verify(resetToken);

    const resetSessionUserId = await this._passwordResetSessionStore.consume(decoded.jti);

    if (resetSessionUserId !== decoded.userId) {
      await this._authSecurityAuditLogger.record({
        userId: decoded.userId,
        eventType: 'PASSWORD_RESET_TOKEN_REPLAY_OR_EXPIRED',
        outcome: 'detected',
      });

      throw AuthApplicationError.invalidResetToken('Invalid or already-used reset token');
    }

    const user = await this._authRepository.findById(decoded.userId);

    if (!user) {
      throw AuthApplicationError.invalidResetToken('Invalid or expired reset token');
    }

    const passwordHash = await this._passwordHasher.hash(newPassword);

    await this._authRepository.updatePasswordHash(user.id, passwordHash);
    await this._authRepository.revokeAllUserSessions(user.id);

    await this._authSecurityAuditLogger.record({
      userId: user.id,
      eventType: 'PASSWORD_RESET_COMPLETED',
      outcome: 'success',
    });
  }
}
