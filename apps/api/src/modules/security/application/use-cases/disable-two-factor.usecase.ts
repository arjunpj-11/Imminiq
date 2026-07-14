import { TWO_FACTOR_DISABLE_ATTEMPT_SCOPE } from '../../domain/security.constants';
import type { ISecurityTwoFactorRepository } from '../../domain/repositories/security-two-factor.repository.interface';
import type { ISecurityAttemptStore } from '../../domain/services/security-attempt-store.interface';
import type { ITwoFactorGateway } from '../../domain/services/two-factor-gateway.interface';
import type { IDisableTwoFactorPayloadDTO, IDisableTwoFactorResponseDTO } from '../security.dto';
import { SecurityApplicationError } from '../security-application.error';

export interface IDisableTwoFactorUseCase {
  execute(
    userId: string,
    payload: IDisableTwoFactorPayloadDTO
  ): Promise<IDisableTwoFactorResponseDTO>;
}

export class DisableTwoFactorUseCase implements IDisableTwoFactorUseCase {
  constructor(
    private readonly _twoFactorRepository: ISecurityTwoFactorRepository,
    private readonly _twoFactorGateway: ITwoFactorGateway,
    private readonly _securityAttemptStore: ISecurityAttemptStore
  ) {}

  async execute(
    userId: string,
    payload: IDisableTwoFactorPayloadDTO
  ): Promise<IDisableTwoFactorResponseDTO> {
    await this.assertDisableVerificationAllowed(userId);

    const twoFactor = await this._twoFactorRepository.findTwoFactorWithSecret(userId);

    if (!twoFactor || twoFactor.status !== 'active') {
      throw SecurityApplicationError.twoFactorNotEnabled();
    }

    if (!twoFactor.totpSecretEncrypted) {
      throw SecurityApplicationError.twoFactorSecretMissing();
    }

    const valid = await this._twoFactorGateway.verifyToken({
      encryptedSecret: twoFactor.totpSecretEncrypted,
      token: payload.token,
    });

    if (!valid) {
      await this.recordInvalidDisableCode(userId);
      throw SecurityApplicationError.invalidTwoFactorCode();
    }

    await this._securityAttemptStore.clear(TWO_FACTOR_DISABLE_ATTEMPT_SCOPE, userId);

    const disabledTwoFactor = await this._twoFactorRepository.disableTwoFactor(userId);

    if (!disabledTwoFactor) {
      throw SecurityApplicationError.twoFactorDisableFailed();
    }

    return { disabled: true };
  }

  private async assertDisableVerificationAllowed(userId: string): Promise<void> {
    const blocked = await this._securityAttemptStore.isBlocked(
      TWO_FACTOR_DISABLE_ATTEMPT_SCOPE,
      userId
    );

    if (blocked) {
      throw SecurityApplicationError.twoFactorDisableTemporarilyBlocked();
    }
  }

  private async recordInvalidDisableCode(userId: string): Promise<void> {
    const result = await this._securityAttemptStore.recordFailure(
      TWO_FACTOR_DISABLE_ATTEMPT_SCOPE,
      userId,
      'twoFactorVerification'
    );

    if (result.blocked) {
      throw SecurityApplicationError.twoFactorDisableTemporarilyBlocked();
    }
  }
}
