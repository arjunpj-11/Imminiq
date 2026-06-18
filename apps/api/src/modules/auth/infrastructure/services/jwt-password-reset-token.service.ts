import { randomUUID } from 'crypto'
import jwt, { SignOptions } from 'jsonwebtoken'

import { env } from '../../../../config/env'
import { AuthDomainError } from '../../domain/errors/auth-domain.error'
import { PASSWORD_RESET_TOKEN_EXPIRES_SECONDS } from '../../domain/constants/auth.constants'
import type { PasswordResetSessionStoreContract } from '../../domain/services/password-reset-session-store.interface'
import type { PasswordResetTokenServiceContract } from '../../domain/services/password-reset-token.service.interface'
import type { ResetTokenPayload } from '../../domain/value-objects/token-payload.vo'
import { redisPasswordResetSessionStore } from '../stores/redis-password-reset-session.store'

export class JwtPasswordResetTokenService
  implements PasswordResetTokenServiceContract {
  constructor(
    private readonly passwordResetSessionStore: PasswordResetSessionStoreContract
  ) {}

  async generate(userId: string): Promise<string> {
    const jti = randomUUID()

    const resetTokenOptions: SignOptions = {
      expiresIn: '10m',
    }

    const token = jwt.sign(
      {
        userId,
        purpose: 'password_reset',
        jti,
      },
      env.JWT_SECRET,
      resetTokenOptions
    )

    await this.passwordResetSessionStore.save(
      jti,
      userId,
      PASSWORD_RESET_TOKEN_EXPIRES_SECONDS
    )

    return token
  }

  verify(resetToken: string): ResetTokenPayload {
    let decoded: ResetTokenPayload

    try {
      decoded = jwt.verify(
        resetToken,
        env.JWT_SECRET
      ) as ResetTokenPayload
    } catch {
      throw new AuthDomainError(
        'INVALID_RESET_TOKEN',
        'Invalid or expired reset token'
      )
    }

    if (
      decoded.purpose !== 'password_reset' ||
      !decoded.userId ||
      !decoded.jti
    ) {
      throw new AuthDomainError(
        'INVALID_RESET_TOKEN',
        'Invalid reset token'
      )
    }

    return decoded
  }
}

export const jwtPasswordResetTokenService =
  new JwtPasswordResetTokenService(redisPasswordResetSessionStore)
