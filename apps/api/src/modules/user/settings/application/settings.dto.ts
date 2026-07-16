import type { ThemeType, NotificationTypeSettings, UserSettingsData } from '../domain/settings.types';

export interface UpdateAppearancePayloadDTO { theme?: ThemeType }
export interface UpdateNotificationsPayloadDTO {
  globalEnabled?: boolean;
  types?: Partial<NotificationTypeSettings>;
}
export interface UpdatePrivacyPayloadDTO {
  showProfile?: boolean;
  showStats?: boolean;
  showActivity?: boolean;
}
export type UserSettingsViewDTO = UserSettingsData;
