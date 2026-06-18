import type { TwoFactorEntity } from '../entities/two-factor.entity'
import type { TwoFactorBackupCodeRecord } from '../value-objects/two-factor-backup-code.vo'

export interface PendingTwoFactorSetupInput {
  encryptedSecret: string
  issuer: string
  accountLabel: string
  qrCodeUri: string
}

export interface SecurityTwoFactorRepositoryContract {
  findTwoFactorByUserId(userId: string): Promise<TwoFactorEntity | null>
  findTwoFactorWithSecret(userId: string): Promise<TwoFactorEntity | null>
  savePendingTwoFactorSetup(
    userId: string,
    data: PendingTwoFactorSetupInput,
  ): Promise<TwoFactorEntity | null>
  activateTwoFactor(
    userId: string,
    backupCodes: TwoFactorBackupCodeRecord[],
  ): Promise<TwoFactorEntity | null>
  disableTwoFactor(userId: string): Promise<TwoFactorEntity | null>
}
