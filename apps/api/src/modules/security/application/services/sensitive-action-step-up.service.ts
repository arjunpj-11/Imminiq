import type { SecurityUserEntity } from '../../domain/entities/security-user.entity';
import type { ISecurityTwoFactorRepository } from '../../domain/repositories/security-two-factor.repository.interface';
import type { ISecurityAuditLogger } from '../../domain/services/security-audit-logger.interface';
import type { ISecurityPasswordHasher } from '../../domain/services/security-password-hasher.interface';
import type { ITwoFactorGateway } from '../../domain/services/two-factor-gateway.interface';
import type { SensitiveSecurityAction } from '../../domain/security.types';
import type { ISensitiveActionStepUpPayloadDTO } from '../security.dto';
import { SecurityApplicationError } from '../security-application.error';

export interface ISensitiveActionAuthorizer {
  assertSatisfied(input: {
    user: SecurityUserEntity;
    payload: ISensitiveActionStepUpPayloadDTO;
    action: SensitiveSecurityAction;
  }): Promise<void>;
}

export class SensitiveActionAuthorizer implements ISensitiveActionAuthorizer {
  constructor(
    private readonly _twoFactorRepository: ISecurityTwoFactorRepository,
    private readonly _twoFactorGateway: ITwoFactorGateway,
    private readonly _passwordHasher: ISecurityPasswordHasher,
    private readonly _securityAuditLogger: ISecurityAuditLogger
  ) {}

  async assertSatisfied(input: {
    user: SecurityUserEntity;
    payload: ISensitiveActionStepUpPayloadDTO;
    action: SensitiveSecurityAction;
  }): Promise<void> {
    const twoFactor = await this._twoFactorRepository.findTwoFactorWithSecret(input.user.id);

    if (input.user.provider === 'local') {
      await this.assertPasswordStepSatisfied(input);
    } else if (twoFactor?.status !== 'active') {
      throw SecurityApplicationError.stepUpRequiresTwoFactorForSocialAccount();
    }

    if (twoFactor?.status === 'active') {
      await this.assertTwoFactorStepSatisfied({
        userId: input.user.id,
        encryptedSecret: twoFactor.totpSecretEncrypted,
        payload: input.payload,
        action: input.action,
      });
    }
  }

  private async assertPasswordStepSatisfied(input: {
    user: SecurityUserEntity;
    payload: ISensitiveActionStepUpPayloadDTO;
    action: SensitiveSecurityAction;
  }): Promise<void> {
    if (!input.payload.currentPassword) {
      throw SecurityApplicationError.stepUpPasswordRequired();
    }

    if (!input.user.passwordHash) {
      throw SecurityApplicationError.stepUpPasswordUnavailable();
    }

    const validPassword = await this._passwordHasher.compare(
      input.payload.currentPassword,
      input.user.passwordHash
    );

    if (validPassword) {
      return;
    }

    await this._securityAuditLogger.record({
      userId: input.user.id,
      eventType: 'SENSITIVE_ACTION_PASSWORD_REAUTH_FAILED',
      outcome: 'failure',
      metadata: { action: input.action },
    });

    throw SecurityApplicationError.stepUpPasswordInvalid();
  }

  private async assertTwoFactorStepSatisfied(input: {
    userId: string;
    encryptedSecret: string | null;
    payload: ISensitiveActionStepUpPayloadDTO;
    action: SensitiveSecurityAction;
  }): Promise<void> {
    if (!input.payload.twoFactorCode) {
      throw SecurityApplicationError.stepUpTwoFactorRequired();
    }

    if (!input.encryptedSecret) {
      throw SecurityApplicationError.twoFactorSecretMissing();
    }

    const validTwoFactorCode = await this._twoFactorGateway.verifyToken({
      encryptedSecret: input.encryptedSecret,
      token: input.payload.twoFactorCode,
    });

    if (validTwoFactorCode) {
      return;
    }

    await this._securityAuditLogger.record({
      userId: input.userId,
      eventType: 'SENSITIVE_ACTION_TWO_FACTOR_REAUTH_FAILED',
      outcome: 'failure',
      metadata: { action: input.action },
    });

    throw SecurityApplicationError.stepUpTwoFactorInvalid();
  }
}
