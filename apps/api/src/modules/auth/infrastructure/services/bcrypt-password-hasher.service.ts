import bcrypt from 'bcryptjs'

import { BCRYPT_ROUNDS } from '../../../../config/constants'
import type { IPasswordHasher } from '../../domain/services/password-hasher.interface'

export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, BCRYPT_ROUNDS)
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    return bcrypt.compare(value, hashedValue)
  }
}

export const bcryptPasswordHasher = new BcryptPasswordHasher()
