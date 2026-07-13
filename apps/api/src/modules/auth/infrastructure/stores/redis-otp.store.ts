import bcrypt from 'bcryptjs';

import { env } from '../../../../config/env';
import { otpCache } from '../../../../infrastructure/cache/otp.cache';
import { AuthDomainError } from '../../domain/auth-domain.error';
import type { IOtpStore } from '../../domain/services/otp-store.interface';
import type { OtpPurpose } from '../../domain/value-objects/otp-purpose.vo';

export class RedisOtpStore implements IOtpStore {
  async saveOtp(data: {
    email?: string;
    phone?: string;
    otp: string;
    purpose: OtpPurpose;
  }): Promise<boolean> {
    const normalizedIdentifier = this.getNormalizedIdentifier(data);

    if (!normalizedIdentifier) {
      throw new AuthDomainError(
        'OTP_IDENTIFIER_REQUIRED',
        'Email or phone is required to save OTP'
      );
    }

    const otpHash = await bcrypt.hash(data.otp, env.BCRYPT_ROUNDS);

    await otpCache.save(normalizedIdentifier, data.purpose, otpHash);

    return true;
  }

  async verifyOtp(data: {
    email?: string;
    phone?: string;
    otp: string;
    purpose: OtpPurpose;
  }): Promise<boolean> {
    const normalizedIdentifier = this.getNormalizedIdentifier(data);

    if (!normalizedIdentifier) {
      return false;
    }

    const otpHash = await otpCache.get(normalizedIdentifier, data.purpose);

    if (!otpHash) {
      return false;
    }

    const match = await bcrypt.compare(data.otp, otpHash);

    if (match) {
      await otpCache.delete(normalizedIdentifier, data.purpose);
    }

    return match;
  }

  private getNormalizedIdentifier(data: { email?: string; phone?: string }): string | null {
    if (data.email) {
      return data.email.toLowerCase().trim();
    }

    if (data.phone) {
      return data.phone.trim().replace(/\s/g, '');
    }

    return null;
  }
}

export const redisOtpStore = new RedisOtpStore();
