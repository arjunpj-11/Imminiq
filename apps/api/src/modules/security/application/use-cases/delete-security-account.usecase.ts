import { ApiError } from '../../../../shared/utils/ApiError'
import type { SecurityRepository } from '../../domain/repositories/security.repository.interface'
import type {
  DeleteAccountPayload,
  DeleteAccountResponse,
} from '../../domain/types/security.types'

export class DeleteSecurityAccountUseCase {
  constructor(
    private readonly securityRepository: SecurityRepository
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

    return {
      deleted: true,
    }
  }
}
