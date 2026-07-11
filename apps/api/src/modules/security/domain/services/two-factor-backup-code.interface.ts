import type { TwoFactorBackupCodeRecord } from '../value-objects/two-factor-backup-code.vo'

export interface ITwoFactorBackupCodeManager {
  generate(): string[]
  hash(backupCodes: string[]): Promise<TwoFactorBackupCodeRecord[]>
}
