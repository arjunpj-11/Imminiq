import type * as Application from './index';
export type SettingsUseCases = {
  dataPrivacyRequests: import('./data-privacy-request.service').IDataPrivacyRequestService;
  getAllSettings: Application.IGetAllSettingsUseCase;
  getAppearanceSettings: Application.IGetAppearanceSettingsUseCase;
  getNotificationSettings: Application.IGetNotificationSettingsUseCase;
  getPrivacySettings: Application.IGetPrivacySettingsUseCase;
  updateAppearance: Application.IUpdateAppearanceUseCase;
  updateNotifications: Application.IUpdateNotificationsUseCase;
  updatePrivacy: Application.IUpdatePrivacyUseCase;
  resetSettingsToDefaults: Application.IResetSettingsToDefaultsUseCase;
};
