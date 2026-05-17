import { ApiError } from '../../../../shared/utils/ApiError'
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

export class VerifyTwoFactorSetupUseCase {
  constructor(
    private readonly securityRepository: SecurityRepository,
    private readonly twoFactorGateway: TwoFactorGateway
  ) {}

  async execute(
    userId: string,
    payload: VerifyTwoFactorSetupPayload
  ): Promise<TwoFactorVerifyResponse> {
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
      throw new ApiError(
        400,
        'Invalid authenticator code',
        'INVALID_TWO_FACTOR_CODE'
      )
    }

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
