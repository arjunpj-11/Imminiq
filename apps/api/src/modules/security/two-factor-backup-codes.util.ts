// apps/api/src/modules/security/two-factor-backup-codes.util.ts

import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { BCRYPT_ROUNDS } from '../../config/constants'

export const TWO_FACTOR_BACKUP_CODE_COUNT = 8

const formatBackupCode = (raw: string) => {
  return `${raw.slice(0, 5)}-${raw.slice(5, 10)}`
}

export const generateBackupCodes = (): string[] => {
  return Array.from({ length: TWO_FACTOR_BACKUP_CODE_COUNT }, () => {
    const raw = randomBytes(5).toString('hex').toUpperCase()
    return formatBackupCode(raw)
  })
}

export const hashBackupCodes = async (
  backupCodes: string[]
): Promise<Array<{ codeHash: string; usedAt: null }>> => {
  return Promise.all(
    backupCodes.map(async (code) => ({
      codeHash: await bcrypt.hash(code, BCRYPT_ROUNDS),
      usedAt: null,
    }))
  )
}