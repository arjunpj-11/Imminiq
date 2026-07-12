import bcrypt from 'bcryptjs'

import { env } from '../../../../config/env'
import { SecurityDomainError } from '../../domain/security-domain.error'
import type { ISecurityPasswordHasher } from '../../domain/services/security-password-hasher.interface'

export class BcryptSecurityPasswordHasher implements ISecurityPasswordHasher {
  async hash(value: string): Promise<string> {
    try {
      return await bcrypt.hash(value, env.BCRYPT_ROUNDS)
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
