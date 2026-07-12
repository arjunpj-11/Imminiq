import { TWO_FACTOR_ISSUER } from '../../domain/constants/security.constants'
import type { ISecurityTwoFactorRepository } from '../../domain/repositories/security-two-factor.repository.interface'
import type { ISecurityUserRepository } from '../../domain/repositories/security-user.repository.interface'
import type { ITwoFactorGateway } from '../../domain/services/two-factor-gateway.interface'
import type { ITwoFactorSetupResponseDTO } from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'

type SetupTwoFactorRepository =
  ISecurityUserRepository & ISecurityTwoFactorRepository

export interface ISetupTwoFactorUseCase {
  execute(userId: string): Promise<ITwoFactorSetupResponseDTO>
}

export class SetupTwoFactorUseCase implements ISetupTwoFactorUseCase {
  constructor(
    private readonly _securityRepository: SetupTwoFactorRepository,
    private readonly _twoFactorGateway: ITwoFactorGateway,
  ) {}

  async execute(userId: string): Promise<ITwoFactorSetupResponseDTO> {
    const user = await this._securityRepository.findUserById(userId)

    if (!user) {
      throw SecurityApplicationError.notFound()
    }

    const existingTwoFactor =
      await this._securityRepository.findTwoFactorByUserId(userId)

    if (existingTwoFactor?.status === 'active') {
      throw SecurityApplicationError.twoFactorAlreadyEnabled()
    }

    const accountLabel = user.email?.trim().toLowerCase() || user.username

    const setup = await this._twoFactorGateway.createSetup({
      issuer: TWO_FACTOR_ISSUER,
      accountLabel,
    })

    const encryptedSecret = this._twoFactorGateway.encryptSecret(setup.secret)

    const setupRecord =
      await this._securityRepository.savePendingTwoFactorSetup({
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