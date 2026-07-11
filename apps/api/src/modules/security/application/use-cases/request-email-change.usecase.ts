import { EMAIL_CHANGE_TOKEN_EXPIRES_MINUTES } from '../../domain/constants/security.constants'
import type { SecurityUserRepositoryContract } from '../../domain/repositories/security-user.repository.interface'
import type { SecurityAuditLoggerContract } from '../../domain/services/security-audit-logger.interface'
import type { SecurityEmailChangeTokenContract } from '../../domain/services/security-email-change-token.interface'
import type { SecurityEmailChangeUrlBuilderContract } from '../../domain/services/security-email-change-url.interface'
import type { SecurityEmailProviderContract } from '../../domain/services/security-email-provider.interface'
import type {
  ChangeEmailPayload,
  EmailChangeRequestResponseDto,
} from '../dtos/security.dto'
import { SecurityApplicationError } from '../errors/security-application.error'
import type { SensitiveActionAuthorizerContract } from '../services/sensitive-action-step-up.service'

export class RequestEmailChangeUseCase {
  constructor(
    private readonly _securityUserRepository: SecurityUserRepositoryContract,
    private readonly _securityEmailProvider: SecurityEmailProviderContract,
    private readonly _sensitiveActionAuthorizer: SensitiveActionAuthorizerContract,
    private readonly _emailChangeToken: SecurityEmailChangeTokenContract,
    private readonly _emailChangeUrlBuilder: SecurityEmailChangeUrlBuilderContract,
    private readonly _securityAuditLogger: SecurityAuditLoggerContract,
  ) {}

  async execute(
    userId: string,
    payload: ChangeEmailPayload,
  ): Promise<EmailChangeRequestResponseDto> {
    const user = await this._securityUserRepository.findUserById(userId)

    if (!user) {
      throw SecurityApplicationError.notFound()
    }

    await this._sensitiveActionAuthorizer.assertSatisfied({
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

    if (await this._securityUserRepository.emailExists(normalizedEmail)) {
      throw SecurityApplicationError.emailTaken()
    }

    const { rawToken, tokenHash, expiresAt } =
      this._emailChangeToken.generate()

    const updatedUser =
      await this._securityUserRepository.savePendingEmailChange({
        userId,
        data: {
          pendingEmail: normalizedEmail,
          tokenHash,
          expiresAt,
        },
      })

    if (!updatedUser) {
      throw SecurityApplicationError.emailChangeRequestFailed()
    }

    const verificationUrl =
      this._emailChangeUrlBuilder.buildVerificationUrl(rawToken)

    await this._securityEmailProvider.sendEmailChangeVerification(
      normalizedEmail,
      {
        fullName: user.fullName,
        newEmail: normalizedEmail,
        verificationUrl,
        expiresMinutes: EMAIL_CHANGE_TOKEN_EXPIRES_MINUTES,
      },
    )

    if (user.email) {
      await this._securityEmailProvider.sendEmailChangeAlert(user.email, {
        fullName: user.fullName,
        requestedNewEmail: normalizedEmail,
      })
    }

    await this._securityAuditLogger.record({
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