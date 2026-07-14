import { redis } from './redis.client';
import { env } from '../../config/env';

export type PhoneOtpPurpose = 'phone_verification' | 'password_reset';

const normalizePhone = (phone: string) => {
  return phone.trim().replace(/\s/g, '');
};

const getKey = (phone: string, purpose: PhoneOtpPurpose) => {
  return `phone-otp-session:${purpose}:${normalizePhone(phone)}`;
};

export const phoneOtpSessionCache = {
  saveVerificationId: async (phone: string, purpose: PhoneOtpPurpose, verificationId: string) => {
    const key = getKey(phone, purpose);

    await redis.set(key, verificationId, 'EX', env.OTP_EXPIRES_MINUTES * 60);
  },

  getVerificationId: async (phone: string, purpose: PhoneOtpPurpose) => {
    const key = getKey(phone, purpose);

    return redis.get(key);
  },

  deleteVerificationId: async (phone: string, purpose: PhoneOtpPurpose) => {
    const key = getKey(phone, purpose);

    await redis.del(key);
  },
};
