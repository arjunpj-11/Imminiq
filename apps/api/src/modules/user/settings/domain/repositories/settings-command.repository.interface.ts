import type { UserSettingsEntity } from '../entities/user-settings.entity';
import type { NotificationTypeSettings, ThemeType } from '../settings.types';

export type SettingsAppearanceUpdateInput = { theme?: ThemeType };
export type SettingsNotificationsUpdateInput = { globalEnabled?: boolean };
export type SettingsPrivacyUpdateInput = {
  showProfile?: boolean;
  showStats?: boolean;
  showActivity?: boolean;
};
export type UpdateSettingsAppearanceInput = { userId: string; data: SettingsAppearanceUpdateInput };
export type UpdateSettingsNotificationsInput = {
  userId: string;
  data: SettingsNotificationsUpdateInput;
};
export type UpdateSettingsNotificationTypesInput = {
  userId: string;
  types: Partial<NotificationTypeSettings>;
};
export type UpdateSettingsPrivacyInput = { userId: string; data: SettingsPrivacyUpdateInput };

export interface ISettingsCommandRepository {
  updateAppearance(input: UpdateSettingsAppearanceInput): Promise<UserSettingsEntity | null>;
  updateNotifications(input: UpdateSettingsNotificationsInput): Promise<UserSettingsEntity | null>;
  updateNotificationTypes(
    input: UpdateSettingsNotificationTypesInput
  ): Promise<UserSettingsEntity | null>;
  updatePrivacy(input: UpdateSettingsPrivacyInput): Promise<UserSettingsEntity | null>;
  resetToDefaults(userId: string): Promise<UserSettingsEntity>;
}
