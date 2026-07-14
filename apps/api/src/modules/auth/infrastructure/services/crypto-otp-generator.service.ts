import crypto from 'crypto';

import type { IOtpGenerator } from '../../domain/services/otp-generator.interface';

export class CryptoOtpGenerator implements IOtpGenerator {
  generate(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }
}

export const cryptoOtpGenerator = new CryptoOtpGenerator();
