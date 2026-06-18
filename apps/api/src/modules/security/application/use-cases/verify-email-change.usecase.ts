import type { SecuritySessionRepositoryContract } from '../../domain/repositories/security-session.repository.interface'
import type { SecurityUserRepositoryContract } from '../../domain/repositories/security-user.repository.interface'
import type { SecurityAuditLoggerContract } from '../../domain/services/security-audit-logger.interface'
import type { SecurityEmailChangeTokenServiceContract } from '../../domain/services/security-email-change-token.service.interface'
import type {
  VerifyEmailChangePayload,
  VerifyEmailChangeResponseDto,
} from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'

type VerifyEmailChangeRepository = SecurityUserRepositoryContract &
  SecuritySessionRepositoryContract

export class VerifyEmailChangeUseCase {
  constructor(
    private readonly securityRepository: VerifyEmailChangeRepository,
    private readonly emailChangeTokenService: SecurityEmailChangeTokenServiceContract,
    private readonly securityAuditLogger: SecurityAuditLoggerContract,
  ) {}

  async execute(
    payload: VerifyEmailChangePayload,
  ): Promise<VerifyEmailChangeResponseDto> {
    const tokenHash = this.emailChangeTokenService.hash(payload.token)
    const user =
      await this.securityRepository.findUserByPendingEmailTokenHash(tokenHash)

    if (!user?.pendingEmail) {
      throw SecurityApplicationError.emailChangeLinkInvalid()
    }

    const pendingEmail = user.pendingEmail.trim().toLowerCase()
    const emailAlreadyUsed =
      await this.securityRepository.emailExists(pendingEmail)

    if (emailAlreadyUsed && user.email?.trim().toLowerCase() !== pendingEmail) {
      await this.securityRepository.clearPendingEmailChange(user.id)
      throw SecurityApplicationError.emailTaken(
        'That email is no longer available',
      )
    }

    const updatedUser = await this.securityRepository.confirmPendingEmailChange(
      user.id,
      pendingEmail,
    )

    if (!updatedUser) {
      throw SecurityApplicationError.emailChangeVerifyFailed()
    }

    await this.securityRepository.revokeAllSessions(user.id)
    await this.securityAuditLogger.record({
      userId: user.id,
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
