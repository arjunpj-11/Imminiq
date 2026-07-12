import {
  ACCOUNT_DELETION_RECOVERY_DAYS,
  ACCOUNT_DELETION_RECOVERY_MS,
} from '../../domain/constants/security.constants'
import type { ISecuritySessionRepository } from '../../domain/repositories/security-session.repository.interface'
import type { ISecurityUserRepository } from '../../domain/repositories/security-user.repository.interface'
import type { ISecurityAuditLogger } from '../../domain/services/security-audit-logger.interface'
import type {
  IDeleteAccountPayloadDTO,
  IDeleteAccountResponseDTO,
} from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'
import type { ISensitiveActionAuthorizer } from '../services/sensitive-action-step-up.service'
import type { IClock } from '../../../../shared/time/clock.interface'

type DeleteSecurityAccountRepository =
  ISecurityUserRepository & ISecuritySessionRepository

export class DeleteSecurityAccountUseCase {
  constructor(
    private readonly _securityRepository: DeleteSecurityAccountRepository,
    private readonly _sensitiveActionAuthorizer: ISensitiveActionAuthorizer,
    private readonly _securityAuditLogger: ISecurityAuditLogger,
    private readonly _clock: IClock,
  ) {}

  async execute(
    userId: string,
    payload: IDeleteAccountPayloadDTO,
  ): Promise<IDeleteAccountResponseDTO> {
    if (payload.confirmation !== 'DELETE') {
      throw SecurityApplicationError.invalidDeleteConfirmation()
    }

    const user = await this._securityRepository.findUserById(userId)

    if (!user) {
      throw SecurityApplicationError.notFound()
    }

    await this._sensitiveActionAuthorizer.assertSatisfied({
      user,
      payload,
      action: 'delete_account',
    })

    await this._securityRepository.revokeAllSessions(userId)

    const scheduledDeletionAt = new Date(
      this._clock.now().getTime() + ACCOUNT_DELETION_RECOVERY_MS,
    )

    const scheduledUser =
      await this._securityRepository.scheduleAccountDeletion({
        userId,
        scheduledDeletionAt,
      })

    if (!scheduledUser) {
      throw SecurityApplicationError.accountDeleteFailed()
    }

    await this._securityAuditLogger.record({
      userId,
      eventType: 'ACCOUNT_DELETION_SCHEDULED',
      outcome: 'success',
    })

    return {
      deleted: true,
      deletionScheduled: true,
      scheduledDeletionAt: scheduledDeletionAt.toISOString(),
      recoveryWindowDays: ACCOUNT_DELETION_RECOVERY_DAYS,
    }
  }
}
