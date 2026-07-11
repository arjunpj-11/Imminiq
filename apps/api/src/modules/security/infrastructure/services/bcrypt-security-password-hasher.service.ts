import bcrypt from 'bcryptjs'

import { BCRYPT_ROUNDS } from '../../../../config/constants'
import { SecurityDomainError } from '../../domain/errors/security-domain.error'
import type { SecurityPasswordHasherContract } from '../../domain/services/security-password-hasher.interface'

export class BcryptSecurityPasswordHasher implements SecurityPasswordHasherContract {
  async hash(value: string): Promise<string> {
    try {
      return await bcrypt.hash(value, BCRYPT_ROUNDS)
    } catch {
      throw new SecurityDomainError(
        'PASSWORD_HASH_FAILED',
        'Password hashing failed',
      )
    }
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    try {
      return await bcrypt.compare(value, hashedValue)
    } catch {
      throw new SecurityDomainError(
        'PASSWORD_COMPARE_FAILED',
        'Password verification failed',
      )
    }
  }
}

export const bcryptSecurityPasswordHasher =
  new BcryptSecurityPasswordHasher()
