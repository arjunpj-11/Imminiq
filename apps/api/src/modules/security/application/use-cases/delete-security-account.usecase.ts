import { ApiError } from '../../../../shared/utils/ApiError'
import { securityAuditLogger } from '../../../../infrastructure/security/security-audit-logger'
import type { SecurityRepository } from '../../domain/repositories/security.repository.interface'
import type {
  DeleteAccountPayload,
  DeleteAccountResponse,
} from '../../domain/types/security.types'
import { SensitiveActionStepUpService } from '../services/sensitive-action-step-up.service'

export class DeleteSecurityAccountUseCase {
  constructor(
    private readonly securityRepository: SecurityRepository,
    private readonly sensitiveActionStepUpService: SensitiveActionStepUpService
  ) {}

  async execute(
    userId: string,
    payload: DeleteAccountPayload
  ): Promise<DeleteAccountResponse> {
    if (payload.confirmation !== 'DELETE') {
      throw new ApiError(
        400,
        'Type DELETE to confirm account deletion',
        'INVALID_DELETE_CONFIRMATION'
      )
    }

    const user = await this.securityRepository.findUserById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    await this.sensitiveActionStepUpService.assertSatisfied({
      user,
      payload,
      action: 'delete_account',
    })

    await this.securityRepository.revokeAllSessions(userId)

    const deletedUser =
      await this.securityRepository.softDeleteAccount(userId)

    if (!deletedUser) {
      throw new ApiError(
        500,
        'Failed to delete account',
        'ACCOUNT_DELETE_FAILED'
      )
    }

    await securityAuditLogger.record({
      userId,
      eventType: 'ACCOUNT_DELETED',
      outcome: 'success',
    })

    return {
      deleted: true,
    }
  }
}
