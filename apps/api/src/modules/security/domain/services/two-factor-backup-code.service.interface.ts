import type { TwoFactorBackupCodeRecord } from '../value-objects/two-factor-backup-code.vo'

export interface TwoFactorBackupCodeServiceContract {
  generate(): string[]
  hash(backupCodes: string[]): Promise<TwoFactorBackupCodeRecord[]>
}
