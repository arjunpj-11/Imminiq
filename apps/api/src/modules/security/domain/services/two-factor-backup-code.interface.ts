import type { TwoFactorBackupCodeRecord } from '../security.types';

export interface ITwoFactorBackupCodeManager {
  generate(): string[];
  hash(backupCodes: string[]): Promise<TwoFactorBackupCodeRecord[]>;
}
