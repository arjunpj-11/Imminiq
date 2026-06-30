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
    private readonly _twoFactorRepository: SecurityTwoFactorRepositoryContract,
    private readonly _twoFactorGateway: TwoFactorGatewayContract,
    private readonly _securityAttemptStore: SecurityAttemptStoreContract,
  ) {}

  async execute(
    userId: string,
    payload: DisableTwoFactorPayload,
  ): Promise<DisableTwoFactorResponseDto> {
    await this.assertDisableVerificationAllowed(userId)

    const twoFactor =
      await this._twoFactorRepository.findTwoFactorWithSecret(userId)

    if (!twoFactor || twoFactor.status !== 'active') {
      throw SecurityApplicationError.twoFactorNotEnabled()
    }

    if (!twoFactor.totpSecretEncrypted) {
      throw SecurityApplicationError.twoFactorSecretMissing()
    }

    const valid = await this._twoFactorGateway.verifyToken({
      encryptedSecret: twoFactor.totpSecretEncrypted,
      token: payload.token,
    })

    if (!valid) {
      await this.recordInvalidDisableCode(userId)
      throw SecurityApplicationError.invalidTwoFactorCode()
    }

    await this._securityAttemptStore.clear(
      TWO_FACTOR_DISABLE_ATTEMPT_SCOPE,
      userId,
    )

    const disabledTwoFactor =
      await this._twoFactorRepository.disableTwoFactor(userId)

    if (!disabledTwoFactor) {
      throw SecurityApplicationError.twoFactorDisableFailed()
    }

    return { disabled: true }
  }

  private async assertDisableVerificationAllowed(
    userId: string,
  ): Promise<void> {
    const blocked = await this._securityAttemptStore.isBlocked(
      TWO_FACTOR_DISABLE_ATTEMPT_SCOPE,
      userId,
    )

    if (blocked) {
      throw SecurityApplicationError.twoFactorDisableTemporarilyBlocked()
    }
  }

  private async recordInvalidDisableCode(userId: string): Promise<void> {
    const result = await this._securityAttemptStore.recordFailure(
      TWO_FACTOR_DISABLE_ATTEMPT_SCOPE,
      userId,
      'twoFactorVerification',
    )

    if (result.blocked) {
      throw SecurityApplicationError.twoFactorDisableTemporarilyBlocked()
    }
  }
}
