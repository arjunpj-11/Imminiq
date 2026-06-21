import type { TwoFactorAuthEntity } from '../entities/two-factor-auth.entity'

export interface AuthTwoFactorRepositoryContract {
  hasActiveTwoFactor(userId: string): Promise<boolean>

  findActiveTwoFactorForLogin(
    userId: string
  ): Promise<TwoFactorAuthEntity | null>

  touchTwoFactorLastUsed(
    userId: string
  ): Promise<TwoFactorAuthEntity | null>

  markBackupCodeUsed(
    userId: string,
    backupCodeIndex: number
  ): Promise<TwoFactorAuthEntity | null>
}