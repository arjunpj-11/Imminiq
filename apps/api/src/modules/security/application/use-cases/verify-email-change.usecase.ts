import type { SecuritySessionRepositoryContract } from '../../domain/repositories/security-session.repository.interface'
import type { SecurityUserRepositoryContract } from '../../domain/repositories/security-user.repository.interface'
import type { SecurityAuditLoggerContract } from '../../domain/services/security-audit-logger.interface'
import type { SecurityEmailChangeTokenServiceContract } from '../../domain/services/security-email-change-token.service.interface'
import type {
  VerifyEmailChangePayload,
  VerifyEmailChangeResponseDto,
} from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'

type VerifyEmailChangeRepository =
  SecurityUserRepositoryContract & SecuritySessionRepositoryContract

export class VerifyEmailChangeUseCase {
  constructor(
    private readonly _securityRepository: VerifyEmailChangeRepository,
    private readonly _emailChangeTokenService: SecurityEmailChangeTokenServiceContract,
    private readonly _securityAuditLogger: SecurityAuditLoggerContract,
  ) {}

  async execute(
    payload: VerifyEmailChangePayload,
  ): Promise<VerifyEmailChangeResponseDto> {
    const tokenHash = this._emailChangeTokenService.hash(payload.token)

    const user =
      await this._securityRepository.findUserByPendingEmailTokenHash(tokenHash)

    if (!user?.pendingEmail) {
      throw SecurityApplicationError.emailChangeLinkInvalid()
    }

    const pendingEmail = user.pendingEmail.trim().toLowerCase()

    const emailAlreadyUsed =
      await this._securityRepository.emailExists(pendingEmail)

    if (emailAlreadyUsed && user.email?.trim().toLowerCase() !== pendingEmail) {
      await this._securityRepository.clearPendingEmailChange(user.id)

      throw SecurityApplicationError.emailTaken(
        'That email is no longer available',
      )
    }

    const updatedUser =
      await this._securityRepository.confirmPendingEmailChange({
        userId: user.id,
        pendingEmail,
      })

    if (!updatedUser) {
      throw SecurityApplicationError.emailChangeVerifyFailed()
    }

    await this._securityRepository.revokeAllSessions(user.id)

    await this._securityAuditLogger.record({
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