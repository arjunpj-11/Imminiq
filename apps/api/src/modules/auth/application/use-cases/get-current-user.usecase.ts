import { authRepository } from '../../auth.repository'
import { ApiError } from '../../../../shared/utils/ApiError'
import type { AuthUser } from '../../domain/types/auth.types'
import { ensureUserCanAuthenticate } from '../services/auth-account-policy.service'
import { formatAuthUser } from '../services/auth-user-formatter.service'

export class GetCurrentUserUseCase {
  async execute(userId: string): Promise<AuthUser> {
    const user = await authRepository.findById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    ensureUserCanAuthenticate(user)

    return formatAuthUser(user)
  }
}
