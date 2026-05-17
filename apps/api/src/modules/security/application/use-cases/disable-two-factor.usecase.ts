import { ApiError } from '../../../../shared/utils/ApiError'
import type { TwoFactorGateway } from '../../domain/gateways/two-factor.gateway'
import type { SecurityRepository } from '../../domain/repositories/security.repository.interface'
import type {
  DisableTwoFactorPayload,
  DisableTwoFactorResponse,
} from '../../domain/types/security.types'

export class DisableTwoFactorUseCase {
  constructor(
    private readonly securityRepository: SecurityRepository,
    private readonly twoFactorGateway: TwoFactorGateway
  ) {}

  async execute(
    userId: string,
    payload: DisableTwoFactorPayload
  ): Promise<DisableTwoFactorResponse> {
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
      throw new ApiError(
        400,
        'Invalid authenticator code',
        'INVALID_TWO_FACTOR_CODE'
      )
    }

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
