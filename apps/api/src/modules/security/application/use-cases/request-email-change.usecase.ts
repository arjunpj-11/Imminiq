import { ApiError } from '../../../../shared/utils/ApiError'
import { env } from '../../../../config/env'
import type { SecurityEmailGateway } from '../../domain/gateways/security-email.gateway'
import type { SecurityRepository } from '../../domain/repositories/security.repository.interface'
import type {
  ChangeEmailPayload,
  EmailChangeRequestResponse,
} from '../../domain/types/security.types'
import {
  EMAIL_CHANGE_TOKEN_EXPIRES_MINUTES,
  generateEmailChangeToken,
} from '../utils/email-change-token.util'

export class RequestEmailChangeUseCase {
  constructor(
    private readonly securityRepository: SecurityRepository,
    private readonly securityEmailGateway: SecurityEmailGateway
  ) {}

  async execute(
    userId: string,
    payload: ChangeEmailPayload
  ): Promise<EmailChangeRequestResponse> {
    const user = await this.securityRepository.findUserById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    const normalizedEmail = payload.newEmail.trim().toLowerCase()

    if (!normalizedEmail) {
      throw new ApiError(
        400,
        'New email is required',
        'EMAIL_REQUIRED'
      )
    }

    if (user.email?.trim().toLowerCase() === normalizedEmail) {
      throw new ApiError(
        400,
        'New email must be different from current email',
        'EMAIL_UNCHANGED'
      )
    }

    const emailAlreadyUsed =
      await this.securityRepository.emailExists(normalizedEmail)

    if (emailAlreadyUsed) {
      throw new ApiError(
        409,
        'Email is already in use',
        'EMAIL_TAKEN'
      )
    }

    const {
      rawToken,
      tokenHash,
      expiresAt,
    } = generateEmailChangeToken()

    const updatedUser =
      await this.securityRepository.savePendingEmailChange(userId, {
        pendingEmail: normalizedEmail,
        tokenHash,
        expiresAt,
      })

    if (!updatedUser) {
      throw new ApiError(
        500,
        'Failed to create email change request',
        'EMAIL_CHANGE_REQUEST_FAILED'
      )
    }

    const verificationUrl =
      `${env.CLIENT_URL}/verify-email-change?token=${rawToken}`

    await this.securityEmailGateway.sendEmailChangeVerification(
      normalizedEmail,
      {
        fullName: user.fullName,
        newEmail: normalizedEmail,
        verificationUrl,
        expiresMinutes: EMAIL_CHANGE_TOKEN_EXPIRES_MINUTES,
      }
    )

    if (user.email) {
      await this.securityEmailGateway.sendEmailChangeAlert(
        user.email,
        {
          fullName: user.fullName,
          requestedNewEmail: normalizedEmail,
        }
      )
    }

    return {
      pendingEmail: normalizedEmail,
      verificationSent: true,
      expiresInMinutes: EMAIL_CHANGE_TOKEN_EXPIRES_MINUTES,
    }
  }
}
