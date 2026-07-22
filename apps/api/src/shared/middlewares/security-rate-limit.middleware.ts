import { rateLimit } from 'express-rate-limit';
import { ApiError } from '../utils/api-error';
import { env } from '../../config/env';
import { redis } from '../../config/redis';
import { RedisRateLimitStore } from '../../infrastructure/cache/redis-rate-limit.store';

const createSensitiveLimiter = (config: {
  windowMs: number;
  limit: number;
  message: string;
  code: string;
}) => {
  return rateLimit({
    windowMs: config.windowMs,
    limit: config.limit,
    store: new RedisRateLimitStore(redis, config.code.toLowerCase()),
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new ApiError(429, config.message, config.code));
    },
  });
};

export const authenticatedApiIpLimiter = createSensitiveLimiter({
  windowMs: env.RATE_LIMIT_AUTHENTICATED_API_WINDOW_MS,
  limit: env.RATE_LIMIT_AUTHENTICATED_API_MAX,
  message: 'Too many authenticated API requests. Please try again later.',
  code: 'AUTHENTICATED_API_RATE_LIMITED',
});

export const authSessionActionIpLimiter = createSensitiveLimiter({
  windowMs: env.RATE_LIMIT_AUTH_SESSION_WINDOW_MS,
  limit: env.RATE_LIMIT_AUTH_SESSION_MAX,
  message: 'Too many session requests. Please try again later.',
  code: 'AUTH_SESSION_ACTION_RATE_LIMITED',
});

export const publicAccountLookupIpLimiter = createSensitiveLimiter({
  windowMs: env.RATE_LIMIT_PUBLIC_LOOKUP_WINDOW_MS,
  limit: env.RATE_LIMIT_PUBLIC_LOOKUP_MAX,
  message: 'Too many account lookup requests. Please try again later.',
  code: 'PUBLIC_ACCOUNT_LOOKUP_RATE_LIMITED',
});

export const oauthFlowIpLimiter = createSensitiveLimiter({
  windowMs: env.RATE_LIMIT_OAUTH_WINDOW_MS,
  limit: env.RATE_LIMIT_OAUTH_MAX,
  message: 'Too many OAuth requests. Please try again later.',
  code: 'OAUTH_FLOW_RATE_LIMITED',
});

export const registerIpLimiter = createSensitiveLimiter({
  windowMs: env.RATE_LIMIT_REGISTER_WINDOW_MS,
  limit: env.RATE_LIMIT_REGISTER_MAX,
  message: 'Too many registration attempts. Please try again later.',
  code: 'REGISTER_RATE_LIMITED',
});

export const loginIpLimiter = createSensitiveLimiter({
  windowMs: env.RATE_LIMIT_LOGIN_WINDOW_MS,
  limit: env.RATE_LIMIT_LOGIN_MAX,
  message: 'Too many login attempts. Please try again later.',
  code: 'LOGIN_RATE_LIMITED',
});

export const twoFactorLoginIpLimiter = createSensitiveLimiter({
  windowMs: env.RATE_LIMIT_SENSITIVE_WINDOW_MS,
  limit: env.RATE_LIMIT_SENSITIVE_DEFAULT_MAX,
  message: 'Too many two-factor attempts. Please try again later.',
  code: 'TWO_FACTOR_LOGIN_RATE_LIMITED',
});

export const authOtpSendIpLimiter = createSensitiveLimiter({
  windowMs: env.RATE_LIMIT_SENSITIVE_WINDOW_MS,
  limit: env.RATE_LIMIT_OTP_SEND_MAX,
  message: 'Too many OTP requests. Please try again later.',
  code: 'OTP_SEND_RATE_LIMITED',
});

export const authOtpVerifyIpLimiter = createSensitiveLimiter({
  windowMs: env.RATE_LIMIT_SENSITIVE_WINDOW_MS,
  limit: env.RATE_LIMIT_SENSITIVE_DEFAULT_MAX,
  message: 'Too many OTP verification attempts. Please try again later.',
  code: 'OTP_VERIFY_RATE_LIMITED',
});

export const forgotPasswordIpLimiter = createSensitiveLimiter({
  windowMs: env.RATE_LIMIT_SENSITIVE_WINDOW_MS,
  limit: env.RATE_LIMIT_FORGOT_PASSWORD_MAX,
  message: 'Too many password-reset requests. Please try again later.',
  code: 'FORGOT_PASSWORD_RATE_LIMITED',
});

export const resetPasswordIpLimiter = createSensitiveLimiter({
  windowMs: env.RATE_LIMIT_SENSITIVE_WINDOW_MS,
  limit: env.RATE_LIMIT_RESET_PASSWORD_MAX,
  message: 'Too many password-reset attempts. Please try again later.',
  code: 'RESET_PASSWORD_RATE_LIMITED',
});

export const publicEmailChangeVerifyIpLimiter = createSensitiveLimiter({
  windowMs: env.RATE_LIMIT_SENSITIVE_WINDOW_MS,
  limit: env.RATE_LIMIT_SENSITIVE_DEFAULT_MAX,
  message: 'Too many email verification attempts. Please try again later.',
  code: 'EMAIL_CHANGE_VERIFY_RATE_LIMITED',
});

export const securityTwoFactorIpLimiter = createSensitiveLimiter({
  windowMs: env.RATE_LIMIT_SENSITIVE_WINDOW_MS,
  limit: env.RATE_LIMIT_SENSITIVE_DEFAULT_MAX,
  message: 'Too many two-factor verification attempts. Please try again later.',
  code: 'SECURITY_TWO_FACTOR_RATE_LIMITED',
});

export const profileImageUploadIpLimiter = createSensitiveLimiter({
  windowMs: env.RATE_LIMIT_SENSITIVE_WINDOW_MS,
  limit: env.RATE_LIMIT_SENSITIVE_DEFAULT_MAX,
  message: 'Too many profile image upload attempts. Please try again later.',
  code: 'PROFILE_IMAGE_UPLOAD_RATE_LIMITED',
});

export const moderationAppealIpLimiter = createSensitiveLimiter({
  windowMs: env.RATE_LIMIT_MODERATION_APPEAL_WINDOW_MS,
  limit: env.RATE_LIMIT_MODERATION_APPEAL_MAX,
  message: 'Too many moderation appeal requests. Please try again later.',
  code: 'MODERATION_APPEAL_RATE_LIMITED',
});
