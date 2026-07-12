import type { TwoFactorBackupCodeRecord } from '../types/security.types'

export interface ITwoFactorBackupCodeManager {
  generate(): string[]
  hash(backupCodes: string[]): Promise<TwoFactorBackupCodeRecord[]>
}
