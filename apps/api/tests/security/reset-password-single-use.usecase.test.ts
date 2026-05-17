import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../src/modules/auth/auth.repository', () => ({
  authRepository: {
    findById: vi.fn(),
    updatePassword: vi.fn(),
    revokeAllUserTokens: vi.fn(),
  },
}))

vi.mock('../../src/infrastructure/cache/password-reset-session.cache', () => ({
  passwordResetSessionCache: {
    consume: vi.fn(),
  },
}))

vi.mock('../../src/infrastructure/security/security-audit-logger', () => ({
  securityAuditLogger: {
    record: vi.fn(),
  },
}))

vi.mock('../../src/modules/auth/application/services/password-reset-token.service', () => ({
  verifyPasswordResetToken: vi.fn(),
}))

import { authRepository } from '../../src/modules/auth/auth.repository'
import { passwordResetSessionCache } from '../../src/infrastructure/cache/password-reset-session.cache'
import { securityAuditLogger } from '../../src/infrastructure/security/security-audit-logger'
import { verifyPasswordResetToken } from '../../src/modules/auth/application/services/password-reset-token.service'
import { ResetPasswordUseCase } from '../../src/modules/auth/application/use-cases/reset-password.usecase'
import { ApiError } from '../../src/shared/utils/ApiError'

const mockedAuthRepository = vi.mocked(authRepository)
const mockedResetSessionCache = vi.mocked(passwordResetSessionCache)
const mockedSecurityAuditLogger = vi.mocked(securityAuditLogger)
const mockedVerifyPasswordResetToken = vi.mocked(verifyPasswordResetToken)

describe('ResetPasswordUseCase one-time reset token protection', () => {
  beforeEach(() => {
    mockedVerifyPasswordResetToken.mockReturnValue({
      userId: 'user-1',
      purpose: 'password_reset',
      jti: 'reset-jti-1',
    })

    mockedAuthRepository.findById.mockResolvedValue({
      _id: {
        toString: () => 'user-1',
      },
    } as never)

    mockedAuthRepository.updatePassword.mockResolvedValue(undefined as never)
    mockedAuthRepository.revokeAllUserTokens.mockResolvedValue(undefined as never)
    mockedSecurityAuditLogger.record.mockResolvedValue(undefined)
  })

  it('allows a reset token once when the reset session is consumed successfully', async () => {
    mockedResetSessionCache.consume.mockResolvedValue('user-1')

    const useCase = new ResetPasswordUseCase()

    await expect(
      useCase.execute('reset-token', 'NewSecurePassword123!')
    ).resolves.toBeUndefined()

    expect(mockedResetSessionCache.consume).toHaveBeenCalledWith('reset-jti-1')
    expect(mockedAuthRepository.updatePassword).toHaveBeenCalledWith(
      'user-1',
      'NewSecurePassword123!'
    )
    expect(mockedAuthRepository.revokeAllUserTokens).toHaveBeenCalledWith(
      'user-1'
    )
    expect(mockedSecurityAuditLogger.record).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        eventType: 'PASSWORD_RESET_COMPLETED',
        outcome: 'success',
      })
    )
  })

  it('rejects a reset token replay after the Redis reset session is gone', async () => {
    mockedResetSessionCache.consume.mockResolvedValue(null)

    const useCase = new ResetPasswordUseCase()

    await expect(
      useCase.execute('reset-token', 'NewSecurePassword123!')
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_RESET_TOKEN',
    } satisfies Partial<ApiError>)

    expect(mockedAuthRepository.updatePassword).not.toHaveBeenCalled()
    expect(mockedSecurityAuditLogger.record).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        eventType: 'PASSWORD_RESET_TOKEN_REPLAY_OR_EXPIRED',
        outcome: 'detected',
      })
    )
  })
})
