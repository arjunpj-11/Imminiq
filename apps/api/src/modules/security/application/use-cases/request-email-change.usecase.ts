import { EMAIL_CHANGE_TOKEN_EXPIRES_MINUTES } from '../../domain/constants/security.constants'
import type { SecurityUserRepositoryContract } from '../../domain/repositories/security-user.repository.interface'
import type { SecurityAuditLoggerContract } from '../../domain/services/security-audit-logger.interface'
import type { SecurityEmailChangeTokenServiceContract } from '../../domain/services/security-email-change-token.service.interface'
import type { SecurityEmailChangeUrlServiceContract } from '../../domain/services/security-email-change-url.service.interface'
import type { SecurityEmailProviderContract } from '../../domain/services/security-email-provider.interface'
import type {
  ChangeEmailPayload,
  EmailChangeRequestResponseDto,
} from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'
import type { SensitiveActionStepUpServiceContract } from '../services/sensitive-action-step-up.service'

export class RequestEmailChangeUseCase {
  constructor(
    private readonly securityUserRepository: SecurityUserRepositoryContract,
    private readonly securityEmailProvider: SecurityEmailProviderContract,
    private readonly sensitiveActionStepUpService: SensitiveActionStepUpServiceContract,
    private readonly emailChangeTokenService: SecurityEmailChangeTokenServiceContract,
    private readonly emailChangeUrlService: SecurityEmailChangeUrlServiceContract,
    private readonly securityAuditLogger: SecurityAuditLoggerContract,
  ) {}

  async execute(
    userId: string,
    payload: ChangeEmailPayload,
  ): Promise<EmailChangeRequestResponseDto> {
    const user = await this.securityUserRepository.findUserById(userId)

    if (!user) {
      throw SecurityApplicationError.notFound()
    }

    await this.sensitiveActionStepUpService.assertSatisfied({
      user,
      payload,
      action: 'change_email',
    })

    const normalizedEmail = payload.newEmail.trim().toLowerCase()

    if (!normalizedEmail) {
      throw SecurityApplicationError.emailRequired()
    }

    if (user.email?.trim().toLowerCase() === normalizedEmail) {
      throw SecurityApplicationError.emailUnchanged()
    }

    if (await this.securityUserRepository.emailExists(normalizedEmail)) {
      throw SecurityApplicationError.emailTaken()
    }

    const { rawToken, tokenHash, expiresAt } =
      this.emailChangeTokenService.generate()

    const updatedUser =
      await this.securityUserRepository.savePendingEmailChange(userId, {
        pendingEmail: normalizedEmail,
        tokenHash,
        expiresAt,
      })

    if (!updatedUser) {
      throw SecurityApplicationError.emailChangeRequestFailed()
    }

    const verificationUrl =
      this.emailChangeUrlService.buildVerificationUrl(rawToken)

    await this.securityEmailProvider.sendEmailChangeVerification(
      normalizedEmail,
      {
        fullName: user.fullName,
        newEmail: normalizedEmail,
        verificationUrl,
        expiresMinutes: EMAIL_CHANGE_TOKEN_EXPIRES_MINUTES,
      },
    )

    if (user.email) {
      await this.securityEmailProvider.sendEmailChangeAlert(user.email, {
        fullName: user.fullName,
        requestedNewEmail: normalizedEmail,
      })
    }

    await this.securityAuditLogger.record({
      userId,
      eventType: 'EMAIL_CHANGE_REQUESTED',
      outcome: 'success',
      metadata: { hasPendingEmail: true },
    })

    return {
      pendingEmail: normalizedEmail,
      verificationSent: true,
      expiresInMinutes: EMAIL_CHANGE_TOKEN_EXPIRES_MINUTES,
    }
  }
}
