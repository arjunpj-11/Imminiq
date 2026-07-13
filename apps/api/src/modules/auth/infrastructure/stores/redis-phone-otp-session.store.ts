import { phoneOtpSessionCache } from '../../../../infrastructure/cache/phone-otp-session.cache';

import type {
  PhoneOtpPurpose,
  IPhoneOtpSessionStore,
} from '../../domain/services/phone-otp-session-store.interface';

export class RedisPhoneOtpSessionStore implements IPhoneOtpSessionStore {
  async saveVerificationId(
    phone: string,
    purpose: PhoneOtpPurpose,
    verificationId: string
  ): Promise<void> {
    await phoneOtpSessionCache.saveVerificationId(phone, purpose, verificationId);
  }

  async getVerificationId(phone: string, purpose: PhoneOtpPurpose): Promise<string | null> {
    return phoneOtpSessionCache.getVerificationId(phone, purpose);
  }

  async deleteVerificationId(phone: string, purpose: PhoneOtpPurpose): Promise<void> {
    await phoneOtpSessionCache.deleteVerificationId(phone, purpose);
  }
}

export const redisPhoneOtpSessionStore = new RedisPhoneOtpSessionStore();
