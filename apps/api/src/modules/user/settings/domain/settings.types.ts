export type ThemeType = 'light' | 'dark' | 'system';

export type NotificationTypeSettings = { adminBroadcasts: boolean };
export type AppearanceSettingsData = { theme?: ThemeType };
export type NotificationSettingsData = {
  globalEnabled?: boolean;
  types?: Partial<NotificationTypeSettings>;
};
export type PrivacySettingsData = {
  showProfile?: boolean;
  showStats?: boolean;
  showActivity?: boolean;
};

export type UserSettingsData = {
  _id?: unknown;
  id?: string;
  userId?: string;
  appearance?: AppearanceSettingsData;
  notifications?: NotificationSettingsData;
  privacy?: PrivacySettingsData;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  [key: string]: unknown;
};

export type { UserSettingsEntity as UserSettingsRecord } from './entities/user-settings.entity';
