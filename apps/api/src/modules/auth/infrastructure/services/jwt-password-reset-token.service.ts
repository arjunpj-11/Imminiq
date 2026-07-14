import { randomUUID } from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';

import { env } from '../../../../config/env';
import { AuthDomainError } from '../../domain/auth-domain.error';
import type { IPasswordResetSessionStore } from '../../domain/services/password-reset-session-store.interface';
import type { IPasswordResetToken } from '../../domain/services/password-reset-token.interface';
import type { ResetTokenPayload } from '../../domain/value-objects/token-payload.vo';
import { redisPasswordResetSessionStore } from '../stores/redis-password-reset-session.store';

export class JwtPasswordResetToken implements IPasswordResetToken {
  constructor(private readonly _passwordResetSessionStore: IPasswordResetSessionStore) {}

  async generate(userId: string): Promise<string> {
    const jti = randomUUID();

    const resetTokenOptions: SignOptions = {
      expiresIn: env.PASSWORD_RESET_TOKEN_TTL_SECONDS,
    };

    const token = jwt.sign(
      {
        userId,
        purpose: 'password_reset',
        jti,
      },
      env.JWT_SECRET,
      resetTokenOptions
    );

    await this._passwordResetSessionStore.save(jti, userId, env.PASSWORD_RESET_TOKEN_TTL_SECONDS);

    return token;
  }

  verify(resetToken: string): ResetTokenPayload {
    let decoded: ResetTokenPayload;

    try {
      decoded = jwt.verify(resetToken, env.JWT_SECRET) as ResetTokenPayload;
    } catch {
      throw new AuthDomainError('INVALID_RESET_TOKEN', 'Invalid or expired reset token');
    }

    if (decoded.purpose !== 'password_reset' || !decoded.userId || !decoded.jti) {
      throw new AuthDomainError('INVALID_RESET_TOKEN', 'Invalid reset token');
    }

    return decoded;
  }
}

export const jwtPasswordResetToken = new JwtPasswordResetToken(redisPasswordResetSessionStore);
