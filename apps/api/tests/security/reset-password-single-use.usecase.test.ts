import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ResetPasswordUseCase } from '../../src/modules/auth/application/use-cases/reset-password.usecase';
import type { IAuthSessionRepository } from '../../src/modules/auth/domain/repositories/auth-session.repository.interface';
import type { IAuthUserRepository } from '../../src/modules/auth/domain/repositories/auth-user.repository.interface';
import type { PasswordHasherServiceContract } from '../../src/modules/auth/domain/services/password-hasher.service.interface';
import type { IPasswordResetSessionStore } from '../../src/modules/auth/domain/services/password-reset-session-store.interface';
import type { PasswordResetTokenServiceContract } from '../../src/modules/auth/domain/services/password-reset-token.service.interface';
import type { ISecurityAuditLogger } from '../../src/modules/auth/domain/services/security-audit-logger.interface';

type ResetPasswordRepository = IAuthUserRepository & IAuthSessionRepository;

const authRepository = {
  findById: vi.fn(),
  updatePasswordHash: vi.fn(),
  revokeAllUserSessions: vi.fn(),
};

const passwordResetTokenService = {
  verify: vi.fn(),
};

const passwordResetSessionStore = {
  consume: vi.fn(),
};

const securityAuditLogger = {
  record: vi.fn(),
};

const passwordHasher = {
  hash: vi.fn(),
};

const createUseCase = (): ResetPasswordUseCase =>
  new ResetPasswordUseCase(
    authRepository as unknown as ResetPasswordRepository,
    passwordResetTokenService as unknown as PasswordResetTokenServiceContract,
    passwordResetSessionStore as unknown as IPasswordResetSessionStore,
    securityAuditLogger as unknown as ISecurityAuditLogger,
    passwordHasher as unknown as PasswordHasherServiceContract
  );

describe('ResetPasswordUseCase one-time reset token protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    passwordResetTokenService.verify.mockReturnValue({
      userId: 'user-1',
      purpose: 'password_reset',
      jti: 'reset-jti-1',
    });

    passwordResetSessionStore.consume.mockResolvedValue('user-1');

    authRepository.findById.mockResolvedValue({
      id: 'user-1',
    });

    passwordHasher.hash.mockResolvedValue('hashed-new-password');

    authRepository.updatePasswordHash.mockResolvedValue(undefined);

    authRepository.revokeAllUserSessions.mockResolvedValue(undefined);

    securityAuditLogger.record.mockResolvedValue(undefined);
  });

  it('allows a reset token once when the reset session is consumed successfully', async () => {
    const useCase = createUseCase();

    await expect(useCase.execute('reset-token', 'NewSecurePassword123!')).resolves.toBeUndefined();

    expect(passwordResetTokenService.verify).toHaveBeenCalledWith('reset-token');

    expect(passwordResetSessionStore.consume).toHaveBeenCalledWith('reset-jti-1');

    expect(authRepository.findById).toHaveBeenCalledWith('user-1');

    expect(passwordHasher.hash).toHaveBeenCalledWith('NewSecurePassword123!');

    expect(authRepository.updatePasswordHash).toHaveBeenCalledWith('user-1', 'hashed-new-password');

    expect(authRepository.revokeAllUserSessions).toHaveBeenCalledWith('user-1');

    expect(securityAuditLogger.record).toHaveBeenCalledWith({
      userId: 'user-1',
      eventType: 'PASSWORD_RESET_COMPLETED',
      outcome: 'success',
    });
  });

  it('rejects a reset token replay after the Redis reset session is gone', async () => {
    passwordResetSessionStore.consume.mockResolvedValue(null);

    const useCase = createUseCase();

    await expect(useCase.execute('reset-token', 'NewSecurePassword123!')).rejects.toMatchObject({
      code: 'INVALID_RESET_TOKEN',
    });

    expect(passwordResetSessionStore.consume).toHaveBeenCalledWith('reset-jti-1');

    expect(securityAuditLogger.record).toHaveBeenCalledWith({
      userId: 'user-1',
      eventType: 'PASSWORD_RESET_TOKEN_REPLAY_OR_EXPIRED',
      outcome: 'detected',
    });

    expect(authRepository.findById).not.toHaveBeenCalled();
    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(authRepository.updatePasswordHash).not.toHaveBeenCalled();
    expect(authRepository.revokeAllUserSessions).not.toHaveBeenCalled();
  });
});
