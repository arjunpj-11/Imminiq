import { TWO_FACTOR_ISSUER } from '../../domain/constants/security.constants'
import type { SecurityTwoFactorRepositoryContract } from '../../domain/repositories/security-two-factor.repository.interface'
import type { SecurityUserRepositoryContract } from '../../domain/repositories/security-user.repository.interface'
import type { TwoFactorGatewayContract } from '../../domain/services/two-factor-gateway.interface'
import type { TwoFactorSetupResponseDto } from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'

type SetupTwoFactorRepository =
  SecurityUserRepositoryContract & SecurityTwoFactorRepositoryContract

export class SetupTwoFactorUseCase {
  constructor(
    private readonly securityRepository: SetupTwoFactorRepository,
    private readonly twoFactorGateway: TwoFactorGatewayContract,
  ) {}

  async execute(userId: string): Promise<TwoFactorSetupResponseDto> {
    const user = await this.securityRepository.findUserById(userId)

    if (!user) {
      throw SecurityApplicationError.notFound()
    }

    const existingTwoFactor =
      await this.securityRepository.findTwoFactorByUserId(userId)

    if (existingTwoFactor?.status === 'active') {
      throw SecurityApplicationError.twoFactorAlreadyEnabled()
    }

    const accountLabel = user.email?.trim().toLowerCase() || user.username

    const setup = await this.twoFactorGateway.createSetup({
      issuer: TWO_FACTOR_ISSUER,
      accountLabel,
    })

    const encryptedSecret = this.twoFactorGateway.encryptSecret(setup.secret)

    const setupRecord =
      await this.securityRepository.savePendingTwoFactorSetup({
        userId,
        data: {
          encryptedSecret,
          issuer: TWO_FACTOR_ISSUER,
          accountLabel,
          qrCodeUri: setup.qrCodeUri,
        },
      })

    if (!setupRecord) {
      throw SecurityApplicationError.twoFactorSetupFailed()
    }

    return {
      qrCodeDataUrl: setup.qrCodeDataUrl,
      manualEntryKey: setup.secret,
      issuer: TWO_FACTOR_ISSUER,
      accountLabel,
    }
  }
}