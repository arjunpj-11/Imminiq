import { ApiError } from '../../../../shared/utils/ApiError'
import {
  SECURITY_ATTEMPT_POLICIES,
  securityAttemptCache,
} from '../../../../infrastructure/cache/security-attempt.cache'
import type { TwoFactorGateway } from '../../domain/services/two-factor.service.interface'
import type { SecurityRepository } from '../../domain/repositories/security.repository.interface'
import type {
  DisableTwoFactorPayload,
  DisableTwoFactorResponse,
} from '../../domain/types/security.types'

const TWO_FACTOR_DISABLE_SCOPE = 'security_two_factor_disable' as const

const assertDisableVerificationAllowed = async (
  userId: string
) => {
  const blocked = await securityAttemptCache.isBlocked(
    TWO_FACTOR_DISABLE_SCOPE,
    userId
  )

  if (!blocked) return

  throw new ApiError(
    429,
    'Too many invalid authenticator codes. Please try again later.',
    'TWO_FACTOR_DISABLE_TEMPORARILY_BLOCKED'
  )
}

const recordInvalidDisableCode = async (
  userId: string
) => {
  const result = await securityAttemptCache.recordFailure(
    TWO_FACTOR_DISABLE_SCOPE,
    userId,
    SECURITY_ATTEMPT_POLICIES.twoFactorVerification
  )

  if (result.blocked) {
    throw new ApiError(
      429,
      'Too many invalid authenticator codes. Please try again later.',
      'TWO_FACTOR_DISABLE_TEMPORARILY_BLOCKED'
    )
  }
}

export class DisableTwoFactorUseCase {
  constructor(
    private readonly securityRepository: SecurityRepository,
    private readonly twoFactorGateway: TwoFactorGateway
  ) {}

  async execute(
    userId: string,
    payload: DisableTwoFactorPayload
  ): Promise<DisableTwoFactorResponse> {
    await assertDisableVerificationAllowed(userId)

    const twoFactor =
      await this.securityRepository.findTwoFactorWithSecret(userId)

    if (!twoFactor || twoFactor.status !== 'active') {
      throw new ApiError(
        400,
        'Two-factor authentication is not enabled',
        'TWO_FACTOR_NOT_ENABLED'
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
      await recordInvalidDisableCode(userId)

      throw new ApiError(
        400,
        'Invalid authenticator code',
        'INVALID_TWO_FACTOR_CODE'
      )
    }

    await securityAttemptCache.clear(
      TWO_FACTOR_DISABLE_SCOPE,
      userId
    )

    const disabledTwoFactor =
      await this.securityRepository.disableTwoFactor(userId)

    if (!disabledTwoFactor) {
      throw new ApiError(
        500,
        'Unable to disable two-factor authentication',
        'TWO_FACTOR_DISABLE_FAILED'
      )
    }

    return {
      disabled: true,
    }
  }
}
