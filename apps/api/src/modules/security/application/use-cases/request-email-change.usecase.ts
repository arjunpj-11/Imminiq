import type { SecurityRuntimePolicy } from '../../domain/security-runtime-policy';
import type { ISecurityUserRepository } from '../../domain/repositories/security-user.repository.interface';
import type { IAccountSecurityAuditLogger } from '../../domain/services/security-audit-logger.interface';
import type { ISecurityEmailChangeToken } from '../../domain/services/security-email-change-token.interface';
import type { ISecurityEmailChangeUrlBuilder } from '../../domain/services/security-email-change-url.interface';
import type { ISecurityEmailProvider } from '../../domain/services/security-email-provider.interface';
import type { ChangeEmailPayloadDTO, EmailChangeRequestResponseDTO } from '../security.dto';
import { SecurityApplicationError } from '../security-application.error';
import type { ISensitiveActionAuthorizer } from '../services/sensitive-action-step-up.service';

export interface IRequestEmailChangeUseCase {
  execute(userId: string, payload: ChangeEmailPayloadDTO): Promise<EmailChangeRequestResponseDTO>;
}

export class RequestEmailChangeUseCase implements IRequestEmailChangeUseCase {
  constructor(
    private readonly _securityUserRepository: ISecurityUserRepository,
    private readonly _securityEmailProvider: ISecurityEmailProvider,
    private readonly _sensitiveActionAuthorizer: ISensitiveActionAuthorizer,
    private readonly _emailChangeToken: ISecurityEmailChangeToken,
    private readonly _emailChangeUrlBuilder: ISecurityEmailChangeUrlBuilder,
    private readonly _accountSecurityAuditLogger: IAccountSecurityAuditLogger,
    private readonly _runtimePolicy: SecurityRuntimePolicy
  ) {}

  async execute(
    userId: string,
    payload: ChangeEmailPayloadDTO
  ): Promise<EmailChangeRequestResponseDTO> {
    const user = await this._securityUserRepository.findUserById(userId);

    if (!user) {
      throw SecurityApplicationError.notFound();
    }

    await this._sensitiveActionAuthorizer.assertSatisfied({
      user,
      payload,
      action: 'change_email',
    });

    const normalizedEmail = payload.newEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      throw SecurityApplicationError.emailRequired();
    }

    if (user.email?.trim().toLowerCase() === normalizedEmail) {
      throw SecurityApplicationError.emailUnchanged();
    }

    if (await this._securityUserRepository.emailExists(normalizedEmail)) {
      throw SecurityApplicationError.emailTaken();
    }

    const { rawToken, tokenHash, expiresAt } = this._emailChangeToken.generate();

    const updatedUser = await this._securityUserRepository.savePendingEmailChange({
      userId,
      data: {
        pendingEmail: normalizedEmail,
        tokenHash,
        expiresAt,
      },
    });

    if (!updatedUser) {
      throw SecurityApplicationError.emailChangeRequestFailed();
    }

    const verificationUrl = this._emailChangeUrlBuilder.buildVerificationUrl(rawToken);

    await this._securityEmailProvider.sendEmailChangeVerification(normalizedEmail, {
      fullName: user.fullName,
      newEmail: normalizedEmail,
      verificationUrl,
      expiresMinutes: this._runtimePolicy.emailChangeTokenTtlMinutes,
    });

    if (user.email) {
      await this._securityEmailProvider.sendEmailChangeAlert(user.email, {
        fullName: user.fullName,
        requestedNewEmail: normalizedEmail,
      });
    }

    await this._accountSecurityAuditLogger.record({
      userId,
      eventType: 'EMAIL_CHANGE_REQUESTED',
      outcome: 'success',
      metadata: { hasPendingEmail: true },
    });

    return {
      pendingEmail: normalizedEmail,
      verificationSent: true,
      expiresInMinutes: this._runtimePolicy.emailChangeTokenTtlMinutes,
    };
  }
}
