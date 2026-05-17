import { ApiError } from '../../../../shared/utils/ApiError'
import { securityAuditLogger } from '../../../../infrastructure/security/security-audit-logger'
import type { SecurityRepository } from '../../domain/repositories/security.repository.interface'
import type {
  VerifyEmailChangePayload,
  VerifyEmailChangeResponse,
} from '../../domain/types/security.types'
import { hashEmailChangeToken } from '../utils/email-change-token.util'

export class VerifyEmailChangeUseCase {
  constructor(
    private readonly securityRepository: SecurityRepository
  ) {}

  async execute(
    payload: VerifyEmailChangePayload
  ): Promise<VerifyEmailChangeResponse> {
    const tokenHash = hashEmailChangeToken(payload.token)

    const user =
      await this.securityRepository.findUserByPendingEmailTokenHash(tokenHash)

    if (!user || !user.pendingEmail) {
      throw new ApiError(
        400,
        'This email verification link is invalid or expired',
        'EMAIL_CHANGE_LINK_INVALID'
      )
    }

    const pendingEmail = user.pendingEmail.trim().toLowerCase()

    const emailAlreadyUsed =
      await this.securityRepository.emailExists(pendingEmail)

    if (
      emailAlreadyUsed &&
      user.email?.trim().toLowerCase() !== pendingEmail
    ) {
      await this.securityRepository.clearPendingEmailChange(String(user._id))

      throw new ApiError(
        409,
        'That email is no longer available',
        'EMAIL_TAKEN'
      )
    }

    const updatedUser =
      await this.securityRepository.confirmPendingEmailChange(
        String(user._id),
        pendingEmail
      )

    if (!updatedUser) {
      throw new ApiError(
        500,
        'Failed to verify email change',
        'EMAIL_CHANGE_VERIFY_FAILED'
      )
    }

    await this.securityRepository.revokeAllSessions(String(user._id))

    await securityAuditLogger.record({
      userId: String(user._id),
      eventType: 'EMAIL_CHANGE_VERIFIED',
      outcome: 'success',
    })

    return {
      email: updatedUser.email ?? pendingEmail,
      emailVerified: updatedUser.emailVerified,
      verified: true,
      sessionsRevoked: true,
    }
  }
}
