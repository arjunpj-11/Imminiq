import type { SettingsUseCases } from './application/settings-use-cases.contract';
import { SettingsMapper, type ISettingsMapper } from './application/settings.mapper';
import { GetAllSettingsUseCase } from './application/use-cases/get-all-settings.usecase';
import { GetAppearanceSettingsUseCase } from './application/use-cases/get-appearance-settings.usecase';
import { GetNotificationSettingsUseCase } from './application/use-cases/get-notification-settings.usecase';
import { GetPrivacySettingsUseCase } from './application/use-cases/get-privacy-settings.usecase';
import { ResetSettingsToDefaultsUseCase } from './application/use-cases/reset-settings-to-defaults.usecase';
import { UpdateAppearanceUseCase } from './application/use-cases/update-appearance.usecase';
import { UpdateNotificationsUseCase } from './application/use-cases/update-notifications.usecase';
import { UpdatePrivacyUseCase } from './application/use-cases/update-privacy.usecase';
import { mongoSettingsRepository } from './infrastructure/repositories/internal/mongo-settings-user.repository';
import { DataPrivacyRequestService } from './infrastructure/services/mongo-data-privacy-request.service';

export type SettingsServiceHelpers = {
  settingsMapper: ISettingsMapper;
};

export type SettingsComposition = {
  useCases: SettingsUseCases;
  helpers: SettingsServiceHelpers;
};

export const createSettingsComposition = (): SettingsComposition => {
  const settingsRepository = mongoSettingsRepository;
  const settingsMapper = new SettingsMapper();

  return {
    useCases: {
      dataPrivacyRequests: new DataPrivacyRequestService(),
      getAllSettings: new GetAllSettingsUseCase(settingsRepository, settingsMapper),

      getAppearanceSettings: new GetAppearanceSettingsUseCase(settingsRepository, settingsMapper),

      getNotificationSettings: new GetNotificationSettingsUseCase(
        settingsRepository,
        settingsMapper
      ),

      getPrivacySettings: new GetPrivacySettingsUseCase(settingsRepository, settingsMapper),

      updateAppearance: new UpdateAppearanceUseCase(settingsRepository, settingsMapper),

      updateNotifications: new UpdateNotificationsUseCase(settingsRepository, settingsMapper),

      updatePrivacy: new UpdatePrivacyUseCase(settingsRepository, settingsMapper),

      resetSettingsToDefaults: new ResetSettingsToDefaultsUseCase(
        settingsRepository,
        settingsMapper
      ),
    },

    helpers: {
      settingsMapper,
    },
  };
};
