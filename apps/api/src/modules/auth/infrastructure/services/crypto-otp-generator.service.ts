import crypto from 'crypto'

import type { OtpGeneratorContract } from '../../domain/services/otp-generator.service.interface'

export class CryptoOtpGeneratorService implements OtpGeneratorContract {
  generate(): string {
    return crypto.randomInt(100000, 1000000).toString()
  }
}

export const cryptoOtpGeneratorService = new CryptoOtpGeneratorService()
