import {
  ACCOUNT_DELETION_RECOVERY_DAYS,
  ACCOUNT_DELETION_RECOVERY_MS,
} from '../../domain/constants/security.constants'
import type { SecuritySessionRepositoryContract } from '../../domain/repositories/security-session.repository.interface'
import type { SecurityUserRepositoryContract } from '../../domain/repositories/security-user.repository.interface'
import type { SecurityAuditLoggerContract } from '../../domain/services/security-audit-logger.interface'
import type {
  DeleteAccountPayload,
  DeleteAccountResponseDto,
} from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'
import type { SensitiveActionStepUpServiceContract } from '../services/sensitive-action-step-up.service'

type DeleteSecurityAccountRepository =
  SecurityUserRepositoryContract & SecuritySessionRepositoryContract

export class DeleteSecurityAccountUseCase {
  constructor(
    private readonly _securityRepository: DeleteSecurityAccountRepository,
    private readonly _sensitiveActionStepUpService: SensitiveActionStepUpServiceContract,
    private readonly _securityAuditLogger: SecurityAuditLoggerContract,
  ) {}

  async execute(
    userId: string,
    payload: DeleteAccountPayload,
  ): Promise<DeleteAccountResponseDto> {
    if (payload.confirmation !== 'DELETE') {
      throw SecurityApplicationError.invalidDeleteConfirmation()
    }

    const user = await this._securityRepository.findUserById(userId)

    if (!user) {
      throw SecurityApplicationError.notFound()
    }

    await this._sensitiveActionStepUpService.assertSatisfied({
      user,
      payload,
      action: 'delete_account',
    })

    await this._securityRepository.revokeAllSessions(userId)

    const scheduledDeletionAt = new Date(
      Date.now() + ACCOUNT_DELETION_RECOVERY_MS,
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