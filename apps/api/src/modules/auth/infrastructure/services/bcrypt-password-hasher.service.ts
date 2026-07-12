import bcrypt from 'bcryptjs'

import { env } from '../../../../config/env'
import type { IPasswordHasher } from '../../domain/services/password-hasher.interface'

export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, env.BCRYPT_ROUNDS)
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    return bcrypt.compare(value, hashedValue)
  }
}

export const bcryptPasswordHasher = new BcryptPasswordHasher()
