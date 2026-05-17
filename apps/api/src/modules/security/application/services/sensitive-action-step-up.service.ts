import bcrypt from 'bcryptjs'

import { ApiError } from '../../../../shared/utils/ApiError'
import { securityAuditLogger } from '../../../../infrastructure/security/security-audit-logger'
import type { TwoFactorGateway } from '../../domain/gateways/two-factor.gateway'
import type { SecurityRepository } from '../../domain/repositories/security.repository.interface'
import type {
  SecurityUserRecord,
  SensitiveActionStepUpPayload,
} from '../../domain/types/security.types'

export class SensitiveActionStepUpService {
  constructor(
    private readonly securityRepository: SecurityRepository,
    private readonly twoFactorGateway: TwoFactorGateway
  ) {}

  async assertSatisfied(input: {
    user: SecurityUserRecord
    payload: SensitiveActionStepUpPayload
    action: 'change_email' | 'delete_account'
  }): Promise<void> {
    const userId = String(input.user._id)
    const twoFactor =
      await this.securityRepository.findTwoFactorWithSecret(userId)

    if (input.user.provider === 'local') {
      if (!input.payload.currentPassword) {
        throw new ApiError(
          400,
          'Current password is required for this security action',
          'STEP_UP_PASSWORD_REQUIRED'
        )
      }

      if (!input.user.passwordHash) {
        throw new ApiError(
          400,
          'Password reauthentication is unavailable for this account',
          'STEP_UP_PASSWORD_UNAVAILABLE'
        )
      }

      const validPassword = await bcrypt.compare(
        input.payload.currentPassword,
        input.user.passwordHash
      )

      if (!validPassword) {
        await securityAuditLogger.record({
          userId,
          eventType: 'SENSITIVE_ACTION_PASSWORD_REAUTH_FAILED',
          outcome: 'failure',
          metadata: {
            action: input.action,
          },
        })

        throw new ApiError(
          401,
          'Current password is incorrect',
          'STEP_UP_PASSWORD_INVALID'
        )
      }
    } else if (twoFactor?.status !== 'active') {
      /**
       * For social-login accounts without a local password, the current backend
       * cannot perform provider reauthentication inline. Requiring 2FA here
       * prevents sensitive changes from relying only on an existing access token.
       */
      throw new ApiError(
        403,
        'Enable two-factor authentication before performing this security action.',
        'STEP_UP_REQUIRES_TWO_FACTOR_FOR_SOCIAL_ACCOUNT'
      )
    }

    if (twoFactor?.status === 'active') {
      if (!input.payload.twoFactorCode) {
        throw new ApiError(
          400,
          'Two-factor code is required for this security action',
          'STEP_UP_TWO_FACTOR_REQUIRED'
        )
      }

      if (!twoFactor.totpSecretEncrypted) {
        throw new ApiError(
          500,
          'Two-factor secret is missing',
          'TWO_FACTOR_SECRET_MISSING'
        )
      }

      const validTwoFactorCode =
        await this.twoFactorGateway.verifyToken({
          encryptedSecret: twoFactor.totpSecretEncrypted,
          token: input.payload.twoFactorCode,
        })

      if (!validTwoFactorCode) {
        await securityAuditLogger.record({
          userId,
          eventType: 'SENSITIVE_ACTION_TWO_FACTOR_REAUTH_FAILED',
          outcome: 'failure',
          metadata: {
            action: input.action,
          },
        })

        throw new ApiError(
          401,
          'Invalid two-factor code',
          'STEP_UP_TWO_FACTOR_INVALID'
        )
      }
    }
  }
}
