import type * as Application from './index';
import type { IDataPrivacyRequestService } from './data-privacy-request.service';
export type SettingsUseCases = {
  dataPrivacyRequests: IDataPrivacyRequestService;
  getAllSettings: Application.IGetAllSettingsUseCase;
  getAppearanceSettings: Application.IGetAppearanceSettingsUseCase;
  getNotificationSettings: Application.IGetNotificationSettingsUseCase;
  getPrivacySettings: Application.IGetPrivacySettingsUseCase;
  updateAppearance: Application.IUpdateAppearanceUseCase;
  updateNotifications: Application.IUpdateNotificationsUseCase;
  updatePrivacy: Application.IUpdatePrivacyUseCase;
  resetSettingsToDefaults: Application.IResetSettingsToDefaultsUseCase;
};
