import type { SecurityUserEntity } from '../entities/security-user.entity'

export interface PendingEmailChangeInput {
  pendingEmail: string
  tokenHash: string
  expiresAt: Date
}

export interface SecurityUserRepositoryContract {
  findUserById(userId: string): Promise<SecurityUserEntity | null>
  emailExists(email: string): Promise<boolean>
  findUserByPendingEmailTokenHash(
    tokenHash: string,
  ): Promise<SecurityUserEntity | null>
  savePendingEmailChange(
    userId: string,
    data: PendingEmailChangeInput,
  ): Promise<SecurityUserEntity | null>
  confirmPendingEmailChange(
    userId: string,
    pendingEmail: string,
  ): Promise<SecurityUserEntity | null>
  clearPendingEmailChange(userId: string): Promise<SecurityUserEntity | null>
  updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<SecurityUserEntity | null>
  scheduleAccountDeletion(
    userId: string,
    scheduledDeletionAt: Date,
  ): Promise<SecurityUserEntity | null>
}
