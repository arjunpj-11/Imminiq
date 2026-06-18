import type { UserPrivacySettingsEntity } from '../entities/user-privacy-settings.entity'
import type { UserProfileEntity } from '../entities/user-profile.entity'
import type { UserIdInput } from '../value-objects/user-id.vo'
import type { UserProfileUpdate } from '../value-objects/user-profile-update.vo'

export interface UserProfileRepositoryContract {
  findByUserId(userId: UserIdInput): Promise<UserProfileEntity | null>
  findPrivacySettings(userId: UserIdInput): Promise<UserPrivacySettingsEntity | null>
  ensureForUser(
    userId: UserIdInput,
    fallbackName?: string,
  ): Promise<UserProfileEntity>
  updateByUserId(
    userId: UserIdInput,
    payload: UserProfileUpdate,
  ): Promise<UserProfileEntity | null>
}
