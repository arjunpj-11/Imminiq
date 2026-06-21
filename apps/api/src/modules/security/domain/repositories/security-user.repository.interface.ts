import type { SecurityUserEntity } from '../entities/security-user.entity'

export type PendingEmailChangeInput = {
  pendingEmail: string
  tokenHash: string
  expiresAt: Date
}

export type SavePendingEmailChangeInput = {
  userId: string
  data: PendingEmailChangeInput
}

export type ConfirmPendingEmailChangeInput = {
  userId: string
  pendingEmail: string
}

export type UpdateSecurityPasswordHashInput = {
  userId: string
  passwordHash: string
}

export type ScheduleAccountDeletionInput = {
  userId: string
  scheduledDeletionAt: Date
}

export interface SecurityUserRepositoryContract {
  findUserById(userId: string): Promise<SecurityUserEntity | null>

  emailExists(email: string): Promise<boolean>

  findUserByPendingEmailTokenHash(
    tokenHash: string
  ): Promise<SecurityUserEntity | null>

  savePendingEmailChange(
    input: SavePendingEmailChangeInput
  ): Promise<SecurityUserEntity | null>

  confirmPendingEmailChange(
    input: ConfirmPendingEmailChangeInput
  ): Promise<SecurityUserEntity | null>

  clearPendingEmailChange(userId: string): Promise<SecurityUserEntity | null>

  updatePasswordHash(
    input: UpdateSecurityPasswordHashInput
  ): Promise<SecurityUserEntity | null>

  scheduleAccountDeletion(
    input: ScheduleAccountDeletionInput
  ): Promise<SecurityUserEntity | null>
}