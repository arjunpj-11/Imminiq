import bcrypt from 'bcryptjs'

import { BCRYPT_ROUNDS } from '../../../../config/constants'
import type { PasswordHasherServiceContract } from '../../domain/services/password-hasher.service.interface'

export class BcryptPasswordHasherService implements PasswordHasherServiceContract {
  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, BCRYPT_ROUNDS)
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    return bcrypt.compare(value, hashedValue)
  }
}

export const bcryptPasswordHasherService = new BcryptPasswordHasherService()
