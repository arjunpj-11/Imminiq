import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';

import { env } from '../../../../config/env';
import { AuthDomainError } from '../../domain/auth-domain.error';
import type { IAuthToken } from '../../domain/services/auth-token.interface';
import type { AuthRole } from '../../domain/value-objects/auth-role.vo';
import type {
  IJwtPayload,
  TwoFactorChallengeTokenPayload,
} from '../../domain/value-objects/token-payload.vo';

export class JwtAuthToken implements IAuthToken {
  generateAccessToken(userId: string, role: AuthRole, sessionId?: string): string {
    const accessTokenOptions: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
      algorithm: 'HS256',
      issuer: 'imminiq-api',
      audience: 'imminiq-web',
    };

    return jwt.sign(
      {
        userId,
        role,
        type: 'access',
        ...(sessionId ? { sessionId } : {}),
      } as IJwtPayload,
      env.JWT_SECRET,
      accessTokenOptions
    );
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  generateTwoFactorChallengeToken(userId: string): string {
    const challengeOptions: SignOptions = {
      expiresIn: `${env.TWO_FACTOR_CHALLENGE_TTL_MINUTES}m`,
      algorithm: 'HS256',
      issuer: 'imminiq-api',
      audience: 'imminiq-web',
    };

    return jwt.sign(
      {
        userId,
        purpose: 'two_factor_login',
      },
      env.JWT_SECRET,
      challengeOptions
    );
  }

  verifyTwoFactorChallengeToken(challengeToken: string): TwoFactorChallengeTokenPayload {
    let decoded: TwoFactorChallengeTokenPayload;

    try {
      decoded = jwt.verify(challengeToken, env.JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'imminiq-api',
        audience: 'imminiq-web',
      }) as TwoFactorChallengeTokenPayload;
    } catch {
      throw new AuthDomainError(
        'TWO_FACTOR_CHALLENGE_EXPIRED',
        'Two-factor challenge expired. Please sign in again.'
      );
    }

    if (decoded.purpose !== 'two_factor_login') {
      throw new AuthDomainError('INVALID_TWO_FACTOR_CHALLENGE', 'Invalid two-factor challenge');
    }

    return decoded;
  }
}

export const jwtAuthToken = new JwtAuthToken();
