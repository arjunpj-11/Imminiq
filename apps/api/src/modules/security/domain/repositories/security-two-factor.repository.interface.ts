import type { TwoFactorEntity } from '../entities/two-factor.entity'
import type { TwoFactorBackupCodeRecord } from '../value-objects/two-factor-backup-code.vo'

export type PendingTwoFactorSetupInput = {
  encryptedSecret: string
  issuer: string
  accountLabel: string
  qrCodeUri: string
}

export type SavePendingTwoFactorSetupInput = {
  userId: string
  data: PendingTwoFactorSetupInput
}

export type ActivateTwoFactorInput = {
  userId: string
  backupCodes: TwoFactorBackupCodeRecord[]
}

export interface SecurityTwoFactorRepositoryContract {
  findTwoFactorByUserId(userId: string): Promise<TwoFactorEntity | null>

  findTwoFactorWithSecret(userId: string): Promise<TwoFactorEntity | null>

  savePendingTwoFactorSetup(
    input: SavePendingTwoFactorSetupInput
  ): Promise<TwoFactorEntity | null>

  activateTwoFactor(
    input: ActivateTwoFactorInput
  ): Promise<TwoFactorEntity | null>

  disableTwoFactor(userId: string): Promise<TwoFactorEntity | null>
}