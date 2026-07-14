import type { UserPrivacySettingsEntity } from '../entities/user-privacy-settings.entity';
import type { UserProfileEntity } from '../entities/user-profile.entity';
import type { UserIdInput } from '../value-objects/user-id.vo';
import type { UserProfileUpdate } from '../value-objects/user-profile-update.vo';

export type EnsureUserProfileInput = {
  userId: UserIdInput;
  fallbackName?: string;
};

export type UpdateUserProfileInput = {
  userId: UserIdInput;
  payload: UserProfileUpdate;
};

export interface IUserProfileRepository {
  findByUserId(userId: UserIdInput): Promise<UserProfileEntity | null>;

  findPrivacySettings(userId: UserIdInput): Promise<UserPrivacySettingsEntity | null>;

  ensureForUser(input: EnsureUserProfileInput): Promise<UserProfileEntity>;

  updateByUserId(input: UpdateUserProfileInput): Promise<UserProfileEntity | null>;
}
