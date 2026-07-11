import crypto from 'crypto'

import type { OtpGeneratorContract } from '../../domain/services/otp-generator.interface'

export class CryptoOtpGenerator implements OtpGeneratorContract {
  generate(): string {
    return crypto.randomInt(100000, 1000000).toString()
  }
}

export const cryptoOtpGenerator = new CryptoOtpGenerator()
