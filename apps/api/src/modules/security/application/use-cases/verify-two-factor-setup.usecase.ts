import { TWO_FACTOR_SETUP_ATTEMPT_SCOPE } from '../../domain/constants/security.constants'
import type { SecurityTwoFactorRepositoryContract } from '../../domain/repositories/security-two-factor.repository.interface'
import type { SecurityAttemptStoreContract } from '../../domain/services/security-attempt-store.interface'
import type { TwoFactorBackupCodeServiceContract } from '../../domain/services/two-factor-backup-code.service.interface'
import type { TwoFactorGatewayContract } from '../../domain/services/two-factor-gateway.interface'
import type {
  TwoFactorVerifyResponseDto,
  VerifyTwoFactorSetupPayload,
} from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'

export class VerifyTwoFactorSetupUseCase {
  constructor(
    private readonly twoFactorRepository: SecurityTwoFactorRepositoryContract,
    private readonly twoFactorGateway: TwoFactorGatewayContract,
    private readonly securityAttemptStore: SecurityAttemptStoreContract,
    private readonly backupCodeService: TwoFactorBackupCodeServiceContract,
  ) {}

  async execute(
    userId: string,
    payload: VerifyTwoFactorSetupPayload,
  ): Promise<TwoFactorVerifyResponseDto> {
    await this.assertSetupVerificationAllowed(userId)

    const twoFactor =
      await this.twoFactorRepository.findTwoFactorWithSecret(userId)

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

    const valid = await this.twoFactorGateway.verifyToken({
      encryptedSecret: twoFactor.totpSecretEncrypted,
      token: payload.token,
    })

    if (!valid) {
      await this.recordInvalidSetupCode(userId)
      throw SecurityApplicationError.invalidTwoFactorCode()
    }

    await this.securityAttemptStore.clear(
      TWO_FACTOR_SETUP_ATTEMPT_SCOPE,
      userId,
    )

    const backupCodes = this.backupCodeService.generate()
    const hashedBackupCodes = await this.backupCodeService.hash(backupCodes)
    const activatedTwoFactor = await this.twoFactorRepository.activateTwoFactor(
      userId,
      hashedBackupCodes,
    )

    if (!activatedTwoFactor) {
      throw SecurityApplicationError.twoFactorEnableFailed()
    }

    return { enabled: true, backupCodes }
  }

  private async assertSetupVerificationAllowed(userId: string): Promise<void> {
    const blocked = await this.securityAttemptStore.isBlocked(
      TWO_FACTOR_SETUP_ATTEMPT_SCOPE,
      userId,
    )

    if (blocked) {
      throw SecurityApplicationError.twoFactorSetupTemporarilyBlocked()
    }
  }

  private async recordInvalidSetupCode(userId: string): Promise<void> {
    const result = await this.securityAttemptStore.recordFailure(
      TWO_FACTOR_SETUP_ATTEMPT_SCOPE,
      userId,
      'twoFactorVerification',
    )

    if (result.blocked) {
      throw SecurityApplicationError.twoFactorSetupTemporarilyBlocked()
    }
  }
}
