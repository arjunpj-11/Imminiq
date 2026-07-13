import { rateLimit } from 'express-rate-limit';
import { ApiError } from '../utils/ApiError';

const createSensitiveLimiter = (config: {
  windowMs: number;
  limit: number;
  message: string;
  code: string;
}) => {
  return rateLimit({
    windowMs: config.windowMs,
    limit: config.limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new ApiError(429, config.message, config.code));
    },
  });
};

export const authenticatedApiIpLimiter = createSensitiveLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 360,
  message: 'Too many authenticated API requests. Please try again later.',
  code: 'AUTHENTICATED_API_RATE_LIMITED',
});

export const authSessionActionIpLimiter = createSensitiveLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 60,
  message: 'Too many session requests. Please try again later.',
  code: 'AUTH_SESSION_ACTION_RATE_LIMITED',
});

export const publicAccountLookupIpLimiter = createSensitiveLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 80,
  message: 'Too many account lookup requests. Please try again later.',
  code: 'PUBLIC_ACCOUNT_LOOKUP_RATE_LIMITED',
});

export const oauthFlowIpLimiter = createSensitiveLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 40,
  message: 'Too many OAuth requests. Please try again later.',
  code: 'OAUTH_FLOW_RATE_LIMITED',
});

export const registerIpLimiter = createSensitiveLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: 'Too many registration attempts. Please try again later.',
  code: 'REGISTER_RATE_LIMITED',
});

export const loginIpLimiter = createSensitiveLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  message: 'Too many login attempts. Please try again later.',
  code: 'LOGIN_RATE_LIMITED',
});

export const twoFactorLoginIpLimiter = createSensitiveLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  message: 'Too many two-factor attempts. Please try again later.',
  code: 'TWO_FACTOR_LOGIN_RATE_LIMITED',
});

export const authOtpSendIpLimiter = createSensitiveLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 8,
  message: 'Too many OTP requests. Please try again later.',
  code: 'OTP_SEND_RATE_LIMITED',
});

export const authOtpVerifyIpLimiter = createSensitiveLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  message: 'Too many OTP verification attempts. Please try again later.',
  code: 'OTP_VERIFY_RATE_LIMITED',
});

export const forgotPasswordIpLimiter = createSensitiveLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 8,
  message: 'Too many password-reset requests. Please try again later.',
  code: 'FORGOT_PASSWORD_RATE_LIMITED',
});

export const resetPasswordIpLimiter = createSensitiveLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 12,
  message: 'Too many password-reset attempts. Please try again later.',
  code: 'RESET_PASSWORD_RATE_LIMITED',
});

export const publicEmailChangeVerifyIpLimiter = createSensitiveLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  message: 'Too many email verification attempts. Please try again later.',
  code: 'EMAIL_CHANGE_VERIFY_RATE_LIMITED',
});

export const securityTwoFactorIpLimiter = createSensitiveLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  message: 'Too many two-factor verification attempts. Please try again later.',
  code: 'SECURITY_TWO_FACTOR_RATE_LIMITED',
});

export const profileImageUploadIpLimiter = createSensitiveLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  message: 'Too many profile image upload attempts. Please try again later.',
  code: 'PROFILE_IMAGE_UPLOAD_RATE_LIMITED',
});

export const moderationAppealIpLimiter = createSensitiveLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: 'Too many moderation appeal requests. Please try again later.',
  code: 'MODERATION_APPEAL_RATE_LIMITED',
});
