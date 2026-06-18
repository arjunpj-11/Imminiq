import { TWO_FACTOR_DISABLE_ATTEMPT_SCOPE } from '../../domain/constants/security.constants'
import type { SecurityTwoFactorRepositoryContract } from '../../domain/repositories/security-two-factor.repository.interface'
import type { SecurityAttemptStoreContract } from '../../domain/services/security-attempt-store.interface'
import type { TwoFactorGatewayContract } from '../../domain/services/two-factor-gateway.interface'
import type {
  DisableTwoFactorPayload,
  DisableTwoFactorResponseDto,
} from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'

export class DisableTwoFactorUseCase {
  constructor(
    private readonly twoFactorRepository: SecurityTwoFactorRepositoryContract,
    private readonly twoFactorGateway: TwoFactorGatewayContract,
    private readonly securityAttemptStore: SecurityAttemptStoreContract,
  ) {}

  async execute(
    userId: string,
    payload: DisableTwoFactorPayload,
  ): Promise<DisableTwoFactorResponseDto> {
    await this.assertDisableVerificationAllowed(userId)

    const twoFactor =
      await this.twoFactorRepository.findTwoFactorWithSecret(userId)

    if (!twoFactor || twoFactor.status !== 'active') {
      throw SecurityApplicationError.twoFactorNotEnabled()
    }

    if (!twoFactor.totpSecretEncrypted) {
      throw SecurityApplicationError.twoFactorSecretMissing()
    }

    const valid = await this.twoFactorGateway.verifyToken({
      encryptedSecret: twoFactor.totpSecretEncrypted,
      token: payload.token,
    })

    if (!valid) {
      await this.recordInvalidDisableCode(userId)
      throw SecurityApplicationError.invalidTwoFactorCode()
    }

    await this.securityAttemptStore.clear(
      TWO_FACTOR_DISABLE_ATTEMPT_SCOPE,
      userId,
    )

    const disabledTwoFactor =
      await this.twoFactorRepository.disableTwoFactor(userId)

    if (!disabledTwoFactor) {
      throw SecurityApplicationError.twoFactorDisableFailed()
    }

    return { disabled: true }
  }

  private async assertDisableVerificationAllowed(
    userId: string,
  ): Promise<void> {
    const blocked = await this.securityAttemptStore.isBlocked(
      TWO_FACTOR_DISABLE_ATTEMPT_SCOPE,
      userId,
    )

    if (blocked) {
      throw SecurityApplicationError.twoFactorDisableTemporarilyBlocked()
    }
  }

  private async recordInvalidDisableCode(userId: string): Promise<void> {
    const result = await this.securityAttemptStore.recordFailure(
      TWO_FACTOR_DISABLE_ATTEMPT_SCOPE,
      userId,
      'twoFactorVerification',
    )

    if (result.blocked) {
      throw SecurityApplicationError.twoFactorDisableTemporarilyBlocked()
    }
  }
}
