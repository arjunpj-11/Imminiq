import type { ISecuritySessionRepository } from '../../domain/repositories/security-session.repository.interface';
import type { ISecurityUserRepository } from '../../domain/repositories/security-user.repository.interface';
import type { IAccountSecurityAuditLogger } from '../../domain/services/security-audit-logger.interface';
import type { ISecurityEmailChangeToken } from '../../domain/services/security-email-change-token.interface';
import type { VerifyEmailChangePayloadDTO, VerifyEmailChangeResponseDTO } from '../security.dto';
import { SecurityApplicationError } from '../security-application.error';

type VerifyEmailChangeRepository = ISecurityUserRepository & ISecuritySessionRepository;

export interface IVerifyEmailChangeUseCase {
  execute(payload: VerifyEmailChangePayloadDTO): Promise<VerifyEmailChangeResponseDTO>;
}

export class VerifyEmailChangeUseCase implements IVerifyEmailChangeUseCase {
  constructor(
    private readonly _securityRepository: VerifyEmailChangeRepository,
    private readonly _emailChangeToken: ISecurityEmailChangeToken,
    private readonly _accountSecurityAuditLogger: IAccountSecurityAuditLogger
  ) {}

  async execute(payload: VerifyEmailChangePayloadDTO): Promise<VerifyEmailChangeResponseDTO> {
    const tokenHash = this._emailChangeToken.hash(payload.token);

    const user = await this._securityRepository.findUserByPendingEmailTokenHash(tokenHash);

    if (!user?.pendingEmail) {
      throw SecurityApplicationError.emailChangeLinkInvalid();
    }

    const pendingEmail = user.pendingEmail.trim().toLowerCase();

    const emailAlreadyUsed = await this._securityRepository.emailExists(pendingEmail);

    if (emailAlreadyUsed && user.email?.trim().toLowerCase() !== pendingEmail) {
      await this._securityRepository.clearPendingEmailChange(user.id);

      throw SecurityApplicationError.emailTaken('That email is no longer available');
    }

    const updatedUser = await this._securityRepository.confirmPendingEmailChange({
      userId: user.id,
      pendingEmail,
    });

    if (!updatedUser) {
      throw SecurityApplicationError.emailChangeVerifyFailed();
    }

    await this._securityRepository.revokeAllSessions(user.id);

    await this._accountSecurityAuditLogger.record({
      userId: user.id,
      eventType: 'EMAIL_CHANGE_VERIFIED',
      outcome: 'success',
    });

    return {
      email: updatedUser.email ?? pendingEmail,
      emailVerified: updatedUser.emailVerified,
      verified: true,
      sessionsRevoked: true,
    };
  }
}
