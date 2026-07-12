import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'

import { env } from '../../../../config/env'
import { TWO_FACTOR_BACKUP_CODE_COUNT } from '../../domain/security.constants'
import { SecurityDomainError } from '../../domain/security-domain.error'
import type { ITwoFactorBackupCodeManager } from '../../domain/services/two-factor-backup-code.interface'

export class CryptoTwoFactorBackupCodeManager implements ITwoFactorBackupCodeManager {
  generate(): string[] {
    try {
      return Array.from({ length: TWO_FACTOR_BACKUP_CODE_COUNT }, () =>
        this.formatBackupCode(randomBytes(5).toString('hex').toUpperCase()),
      )
    } catch {
      throw new SecurityDomainError(
        'BACKUP_CODE_GENERATION_FAILED',
        'Two-factor backup code generation failed',
      )
    }
  }

  async hash(backupCodes: string[]) {
    try {
      return await Promise.all(
        backupCodes.map(async (code) => ({
          codeHash: await bcrypt.hash(code, env.BCRYPT_ROUNDS),
          usedAt: null,
        })),
      )
    } catch {
      throw new SecurityDomainError(
        'BACKUP_CODE_HASH_FAILED',
        'Two-factor backup code hashing failed',
      )
    }
  }

  private formatBackupCode(raw: string): string {
    return `${raw.slice(0, 5)}-${raw.slice(5, 10)}`
  }
}

export const cryptoTwoFactorBackupCodeManager =
  new CryptoTwoFactorBackupCodeManager()
