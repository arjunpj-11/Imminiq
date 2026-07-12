import { TWO_FACTOR_SETUP_ATTEMPT_SCOPE } from '../../domain/constants/security.constants'
import type { ISecurityTwoFactorRepository } from '../../domain/repositories/security-two-factor.repository.interface'
import type { ISecurityAttemptStore } from '../../domain/services/security-attempt-store.interface'
import type { ITwoFactorBackupCodeManager } from '../../domain/services/two-factor-backup-code.interface'
import type { ITwoFactorGateway } from '../../domain/services/two-factor-gateway.interface'
import type {
  ITwoFactorVerifyResponseDTO,
  IVerifyTwoFactorSetupPayloadDTO,
} from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'

export class VerifyTwoFactorSetupUseCase {
  constructor(
    private readonly _twoFactorRepository: ISecurityTwoFactorRepository,
    private readonly _twoFactorGateway: ITwoFactorGateway,
    private readonly _securityAttemptStore: ISecurityAttemptStore,
    private readonly _backupCodeManager: ITwoFactorBackupCodeManager,
  ) {}

  async execute(
    userId: string,
    payload: IVerifyTwoFactorSetupPayloadDTO,
  ): Promise<ITwoFactorVerifyResponseDTO> {
    await this.assertSetupVerificationAllowed(userId)

    const twoFactor =
      await this._twoFactorRepository.findTwoFactorWithSecret(userId)

    if (!twoFactor) {
      throw SecurityApplicationError.twoFactorSetupNotFound()
    }

    if (twoFactor.status === 'active') {
      throw SecurityApplicationError.twoFactorAlreadyEnabled()
    }

    if (twoFactor.status !== 'pending') {
      throw SecurityApplicationError.twoFactorSetupNotPending()
    }

    if (!twoFactor.totpSecretEncrypted) {
      throw SecurityApplicationError.twoFactorSecretMissing()
    }

    const valid = await this._twoFactorGateway.verifyToken({
      encryptedSecret: twoFactor.totpSecretEncrypted,
      token: payload.token,
    })

    if (!valid) {
      await this.recordInvalidSetupCode(userId)
      throw SecurityApplicationError.invalidTwoFactorCode()
    }

    await this._securityAttemptStore.clear(
      TWO_FACTOR_SETUP_ATTEMPT_SCOPE,
      userId,
    )

    const backupCodes = this._backupCodeManager.generate()
    const hashedBackupCodes = await this._backupCodeManager.hash(backupCodes)

  const activatedTwoFactor =
  await this._twoFactorRepository.activateTwoFactor({
    userId,
    backupCodes: hashedBackupCodes,
  })
    if (!activatedTwoFactor) {
      throw SecurityApplicationError.twoFactorEnableFailed()
    }

    return { enabled: true, backupCodes }
  }

  private async assertSetupVerificationAllowed(userId: string): Promise<void> {
    const blocked = await this._securityAttemptStore.isBlocked(
      TWO_FACTOR_SETUP_ATTEMPT_SCOPE,
      userId,
    )

    if (blocked) {
      throw SecurityApplicationError.twoFactorSetupTemporarilyBlocked()
    }
  }

  private async recordInvalidSetupCode(userId: string): Promise<void> {
    const result = await this._securityAttemptStore.recordFailure(
      TWO_FACTOR_SETUP_ATTEMPT_SCOPE,
      userId,
      'twoFactorVerification',
    )

    if (result.blocked) {
      throw SecurityApplicationError.twoFactorSetupTemporarilyBlocked()
    }
  }
}