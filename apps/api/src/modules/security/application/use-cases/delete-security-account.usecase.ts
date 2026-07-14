import type { ISecuritySessionRepository } from '../../domain/repositories/security-session.repository.interface';
import type { ISecurityUserRepository } from '../../domain/repositories/security-user.repository.interface';
import type { ISecurityAuditLogger } from '../../domain/services/security-audit-logger.interface';
import type { DeleteAccountPayloadDTO, DeleteAccountResponseDTO } from '../security.dto';
import { SecurityApplicationError } from '../security-application.error';
import type { ISensitiveActionAuthorizer } from '../services/sensitive-action-step-up.service';
import type { IClock } from '../../../../shared/time/clock.interface';
import type { ISecurityProductPolicyReader } from '../../../../shared/platform-policy';

type DeleteSecurityAccountRepository = ISecurityUserRepository & ISecuritySessionRepository;

export interface IDeleteSecurityAccountUseCase {
  execute(userId: string, payload: DeleteAccountPayloadDTO): Promise<DeleteAccountResponseDTO>;
}

export class DeleteSecurityAccountUseCase implements IDeleteSecurityAccountUseCase {
  constructor(
    private readonly _securityRepository: DeleteSecurityAccountRepository,
    private readonly _sensitiveActionAuthorizer: ISensitiveActionAuthorizer,
    private readonly _securityAuditLogger: ISecurityAuditLogger,
    private readonly _clock: IClock,
    private readonly _policyReader: ISecurityProductPolicyReader
  ) {}

  async execute(
    userId: string,
    payload: DeleteAccountPayloadDTO
  ): Promise<DeleteAccountResponseDTO> {
    const policy = await this._policyReader.getSecurityProductPolicy();
    if (payload.confirmation !== 'DELETE') {
      throw SecurityApplicationError.invalidDeleteConfirmation();
    }

    const user = await this._securityRepository.findUserById(userId);

    if (!user) {
      throw SecurityApplicationError.notFound();
    }

    await this._sensitiveActionAuthorizer.assertSatisfied({
      user,
      payload,
      action: 'delete_account',
    });

    await this._securityRepository.revokeAllSessions(userId);

    const scheduledDeletionAt = new Date(
      this._clock.now().getTime() + policy.accountDeletionRecoveryDays * 24 * 60 * 60 * 1000
    );

    const scheduledUser = await this._securityRepository.scheduleAccountDeletion({
      userId,
      scheduledDeletionAt,
    });

    if (!scheduledUser) {
      throw SecurityApplicationError.accountDeleteFailed();
    }

    await this._securityAuditLogger.record({
      userId,
      eventType: 'ACCOUNT_DELETION_SCHEDULED',
      outcome: 'success',
    });

    return {
      deleted: true,
      deletionScheduled: true,
      scheduledDeletionAt: scheduledDeletionAt.toISOString(),
      recoveryWindowDays: policy.accountDeletionRecoveryDays,
    };
  }
}
