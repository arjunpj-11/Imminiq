import { ApiError } from '../../../../shared/utils/ApiError'
import {
  SECURITY_ATTEMPT_POLICIES,
  securityAttemptCache,
} from '../../../../infrastructure/cache/security-attempt.cache'
import type { TwoFactorGateway } from '../../domain/gateways/two-factor.gateway'
import type { SecurityRepository } from '../../domain/repositories/security.repository.interface'
import type {
  TwoFactorVerifyResponse,
  VerifyTwoFactorSetupPayload,
} from '../../domain/types/security.types'
import {
  generateBackupCodes,
  hashBackupCodes,
} from '../utils/two-factor-backup-codes.util'

const TWO_FACTOR_SETUP_SCOPE = 'security_two_factor_setup' as const

const assertSetupVerificationAllowed = async (
  userId: string
) => {
  const blocked = await securityAttemptCache.isBlocked(
    TWO_FACTOR_SETUP_SCOPE,
    userId
  )

  if (!blocked) return

  throw new ApiError(
    429,
    'Too many invalid authenticator codes. Start setup again or try later.',
    'TWO_FACTOR_SETUP_TEMPORARILY_BLOCKED'
  )
}

const recordInvalidSetupCode = async (
  userId: string
) => {
  const result = await securityAttemptCache.recordFailure(
    TWO_FACTOR_SETUP_SCOPE,
    userId,
    SECURITY_ATTEMPT_POLICIES.twoFactorVerification
  )

  if (result.blocked) {
    throw new ApiError(
      429,
      'Too many invalid authenticator codes. Start setup again or try later.',
      'TWO_FACTOR_SETUP_TEMPORARILY_BLOCKED'
    )
  }
}

export class VerifyTwoFactorSetupUseCase {
  constructor(
    private readonly securityRepository: SecurityRepository,
    private readonly twoFactorGateway: TwoFactorGateway
  ) {}

  async execute(
    userId: string,
    payload: VerifyTwoFactorSetupPayload
  ): Promise<TwoFactorVerifyResponse> {
    await assertSetupVerificationAllowed(userId)

    const twoFactor =
      await this.securityRepository.findTwoFactorWithSecret(userId)

    if (!twoFactor) {
      throw new ApiError(
        404,
        'Two-factor setup was not found',
        'TWO_FACTOR_SETUP_NOT_FOUND'
      )
    }

    if (twoFactor.status === 'active') {
      throw new ApiError(
        409,
        'Two-factor authentication is already enabled',
        'TWO_FACTOR_ALREADY_ENABLED'
      )
    }

    if (twoFactor.status !== 'pending') {
      throw new ApiError(
        400,
        'Start two-factor setup again before verifying',
        'TWO_FACTOR_SETUP_NOT_PENDING'
      )
    }

    if (!twoFactor.totpSecretEncrypted) {
      throw new ApiError(
        500,
        'Two-factor secret is missing',
        'TWO_FACTOR_SECRET_MISSING'
      )
    }

    const valid = await this.twoFactorGateway.verifyToken({
      encryptedSecret: twoFactor.totpSecretEncrypted,
      token: payload.token,
    })

    if (!valid) {
      await recordInvalidSetupCode(userId)

      throw new ApiError(
        400,
        'Invalid authenticator code',
        'INVALID_TWO_FACTOR_CODE'
      )
    }

    await securityAttemptCache.clear(
      TWO_FACTOR_SETUP_SCOPE,
      userId
    )

    const backupCodes = generateBackupCodes()
    const hashedBackupCodes = await hashBackupCodes(backupCodes)

    const activatedTwoFactor =
      await this.securityRepository.activateTwoFactor(
        userId,
        hashedBackupCodes
      )

    if (!activatedTwoFactor) {
      throw new ApiError(
        500,
        'Unable to enable two-factor authentication',
        'TWO_FACTOR_ENABLE_FAILED'
      )
    }

    return {
      enabled: true,
      backupCodes,
    }
  }
}
