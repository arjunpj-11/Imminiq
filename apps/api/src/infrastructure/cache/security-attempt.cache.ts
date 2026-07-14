import { createHash } from 'crypto';
import { redis } from '../../config/redis';
import { env } from '../../config/env';

export type SecurityAttemptScope =
  | 'auth_login'
  | 'auth_verify_account_otp'
  | 'auth_verify_reset_otp'
  | 'auth_two_factor_login'
  | 'security_two_factor_setup'
  | 'security_two_factor_disable';

export type SecurityAttemptPolicy = {
  windowSeconds: number;
  maxAttempts: number;
  blockSeconds: number;
};

export const SECURITY_ATTEMPT_POLICIES = {
  authLogin: {
    windowSeconds: env.AUTH_LOGIN_ATTEMPT_WINDOW_SECONDS,
    maxAttempts: env.AUTH_LOGIN_MAX_ATTEMPTS,
    blockSeconds: env.AUTH_LOGIN_BLOCK_SECONDS,
  },

  otpVerification: {
    windowSeconds: env.OTP_ATTEMPT_WINDOW_SECONDS,
    maxAttempts: env.OTP_MAX_ATTEMPTS,
    blockSeconds: env.OTP_BLOCK_SECONDS,
  },

  twoFactorVerification: {
    windowSeconds: env.TWO_FACTOR_ATTEMPT_WINDOW_SECONDS,
    maxAttempts: env.TWO_FACTOR_MAX_ATTEMPTS,
    blockSeconds: env.TWO_FACTOR_BLOCK_SECONDS,
  },
} satisfies Record<string, SecurityAttemptPolicy>;

const digestSubject = (subject: string) => {
  return createHash('sha256').update(subject.trim().toLowerCase()).digest('hex');
};

const attemptsKey = (scope: SecurityAttemptScope, subject: string) => {
  return `security-attempts:${scope}:${digestSubject(subject)}`;
};

const blockedKey = (scope: SecurityAttemptScope, subject: string) => {
  return `security-blocked:${scope}:${digestSubject(subject)}`;
};

export const securityAttemptCache = {
  async isBlocked(scope: SecurityAttemptScope, subject: string): Promise<boolean> {
    const exists = await redis.exists(blockedKey(scope, subject));
    return exists === 1;
  },

  async getRetryAfterSeconds(scope: SecurityAttemptScope, subject: string): Promise<number> {
    const ttl = await redis.ttl(blockedKey(scope, subject));
    return ttl > 0 ? ttl : 0;
  },

  async recordFailure(
    scope: SecurityAttemptScope,
    subject: string,
    policy: SecurityAttemptPolicy
  ): Promise<{
    blocked: boolean;
    attempts: number;
    remainingAttempts: number;
  }> {
    const key = attemptsKey(scope, subject);

    const attempts = await redis.incr(key);

    if (attempts === 1) {
      await redis.expire(key, policy.windowSeconds);
    }

    if (attempts >= policy.maxAttempts) {
      await redis.set(blockedKey(scope, subject), '1', 'EX', policy.blockSeconds);

      await redis.del(key);

      return {
        blocked: true,
        attempts,
        remainingAttempts: 0,
      };
    }

    return {
      blocked: false,
      attempts,
      remainingAttempts: Math.max(policy.maxAttempts - attempts, 0),
    };
  },

  async clear(scope: SecurityAttemptScope, subject: string): Promise<void> {
    await Promise.all([
      redis.del(attemptsKey(scope, subject)),
      redis.del(blockedKey(scope, subject)),
    ]);
  },
};
