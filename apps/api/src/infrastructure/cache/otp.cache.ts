import { redis } from './redis.client';

const OTP_TTL_SECONDS = 10 * 60; // 10 minutes

export type OtpPurpose = 'email_verification' | 'phone_verification' | 'password_reset';

const normalizeIdentifier = (identifier: string) => {
  return identifier.trim().toLowerCase();
};

const getKey = (identifier: string, purpose: OtpPurpose) => {
  return `otp:${purpose}:${normalizeIdentifier(identifier)}`;
};

export const otpCache = {
  save: async (identifier: string, purpose: OtpPurpose, otpHash: string) => {
    const key = getKey(identifier, purpose);

    await redis.set(key, otpHash, 'EX', OTP_TTL_SECONDS);
  },

  get: async (identifier: string, purpose: OtpPurpose) => {
    const key = getKey(identifier, purpose);

    return redis.get(key);
  },

  delete: async (identifier: string, purpose: OtpPurpose) => {
    const key = getKey(identifier, purpose);

    await redis.del(key);
  },
};
