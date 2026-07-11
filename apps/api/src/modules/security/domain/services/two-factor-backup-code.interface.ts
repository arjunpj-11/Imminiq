import type { TwoFactorBackupCodeRecord } from '../value-objects/two-factor-backup-code.vo'

export interface TwoFactorBackupCodeManagerContract {
  generate(): string[]
  hash(backupCodes: string[]): Promise<TwoFactorBackupCodeRecord[]>
}
