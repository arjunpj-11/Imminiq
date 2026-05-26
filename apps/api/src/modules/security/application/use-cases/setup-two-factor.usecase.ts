import { ApiError } from '../../../../shared/utils/ApiError'
import type { TwoFactorGateway } from '../../domain/services/two-factor.service.interface'
import type { SecurityRepository } from '../../domain/repositories/security.repository.interface'
import type { TwoFactorSetupResponse } from '../../domain/types/security.types'

const TWO_FACTOR_ISSUER = 'Imminiq'

export class SetupTwoFactorUseCase {
  constructor(
    private readonly securityRepository: SecurityRepository,
    private readonly twoFactorGateway: TwoFactorGateway
  ) {}

  async execute(
    userId: string
  ): Promise<TwoFactorSetupResponse> {
    const user = await this.securityRepository.findUserById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    const existingTwoFactor =
      await this.securityRepository.findTwoFactorByUserId(userId)

    if (existingTwoFactor?.status === 'active') {
      throw new ApiError(
        409,
        'Two-factor authentication is already enabled',
        'TWO_FACTOR_ALREADY_ENABLED'
      )
    }

    const accountLabel =
      user.email?.trim().toLowerCase() || user.username

    const setup = await this.twoFactorGateway.createSetup({
      issuer: TWO_FACTOR_ISSUER,
      accountLabel,
    })

    const encryptedSecret = this.twoFactorGateway.encryptSecret(
      setup.secret
    )

    const setupRecord =
      await this.securityRepository.savePendingTwoFactorSetup(userId, {
        encryptedSecret,
        issuer: TWO_FACTOR_ISSUER,
        accountLabel,
        qrCodeUri: setup.qrCodeUri,
      })

    if (!setupRecord) {
      throw new ApiError(
        500,
        'Unable to start two-factor setup',
        'TWO_FACTOR_SETUP_FAILED'
      )
    }

    return {
      qrCodeDataUrl: setup.qrCodeDataUrl,
      manualEntryKey: setup.secret,
      issuer: TWO_FACTOR_ISSUER,
      accountLabel,
    }
  }
}
