import type { SecurityUserEntity } from '../../domain/entities/security-user.entity'
import type { SecurityTwoFactorRepositoryContract } from '../../domain/repositories/security-two-factor.repository.interface'
import type { SecurityAuditLoggerContract } from '../../domain/services/security-audit-logger.interface'
import type { SecurityPasswordHasherServiceContract } from '../../domain/services/security-password-hasher.service.interface'
import type { TwoFactorGatewayContract } from '../../domain/services/two-factor-gateway.interface'
import type { SensitiveSecurityAction } from '../../domain/value-objects/sensitive-security-action.vo'
import type { SensitiveActionStepUpPayload } from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'

export interface SensitiveActionStepUpServiceContract {
  assertSatisfied(input: {
    user: SecurityUserEntity
    payload: SensitiveActionStepUpPayload
    action: SensitiveSecurityAction
  }): Promise<void>
}

export class SensitiveActionStepUpService implements SensitiveActionStepUpServiceContract {
  constructor(
    private readonly twoFactorRepository: SecurityTwoFactorRepositoryContract,
    private readonly twoFactorGateway: TwoFactorGatewayContract,
    private readonly passwordHasher: SecurityPasswordHasherServiceContract,
    private readonly securityAuditLogger: SecurityAuditLoggerContract,
  ) {}

  async assertSatisfied(input: {
    user: SecurityUserEntity
    payload: SensitiveActionStepUpPayload
    action: SensitiveSecurityAction
  }): Promise<void> {
    const twoFactor = await this.twoFactorRepository.findTwoFactorWithSecret(
      input.user.id,
    )

    if (input.user.provider === 'local') {
      await this.assertPasswordStepSatisfied(input)
    } else if (twoFactor?.status !== 'active') {
      throw SecurityApplicationError.stepUpRequiresTwoFactorForSocialAccount()
    }

    if (twoFactor?.status === 'active') {
      await this.assertTwoFactorStepSatisfied({
        userId: input.user.id,
        encryptedSecret: twoFactor.totpSecretEncrypted,
        payload: input.payload,
        action: input.action,
      })
    }
  }

  private async assertPasswordStepSatisfied(input: {
    user: SecurityUserEntity
    payload: SensitiveActionStepUpPayload
    action: SensitiveSecurityAction
  }): Promise<void> {
    if (!input.payload.currentPassword) {
      throw SecurityApplicationError.stepUpPasswordRequired()
    }

    if (!input.user.passwordHash) {
      throw SecurityApplicationError.stepUpPasswordUnavailable()
    }

    const validPassword = await this.passwordHasher.compare(
      input.payload.currentPassword,
      input.user.passwordHash,
    )

    if (validPassword) {
      return
    }

    await this.securityAuditLogger.record({
      userId: input.user.id,
      eventType: 'SENSITIVE_ACTION_PASSWORD_REAUTH_FAILED',
      outcome: 'failure',
      metadata: { action: input.action },
    })

    throw SecurityApplicationError.stepUpPasswordInvalid()
  }

  private async assertTwoFactorStepSatisfied(input: {
    userId: string
    encryptedSecret: string | null
    payload: SensitiveActionStepUpPayload
    action: SensitiveSecurityAction
  }): Promise<void> {
    if (!input.payload.twoFactorCode) {
      throw SecurityApplicationError.stepUpTwoFactorRequired()
    }

    if (!input.encryptedSecret) {
      throw SecurityApplicationError.twoFactorSecretMissing()
    }

    const validTwoFactorCode = await this.twoFactorGateway.verifyToken({
      encryptedSecret: input.encryptedSecret,
      token: input.payload.twoFactorCode,
    })

    if (validTwoFactorCode) {
      return
    }

    await this.securityAuditLogger.record({
      userId: input.userId,
      eventType: 'SENSITIVE_ACTION_TWO_FACTOR_REAUTH_FAILED',
      outcome: 'failure',
      metadata: { action: input.action },
    })

    throw SecurityApplicationError.stepUpTwoFactorInvalid()
  }
}
