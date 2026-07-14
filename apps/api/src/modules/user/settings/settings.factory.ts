import type { SettingsUseCases } from './application/settings-use-cases.contract';
import { SettingsMapper, type ISettingsMapper } from './application/settings.mapper';
import { GetAllSettingsUseCase } from './application/use-cases/get-all-settings.usecase';
import { GetAppearanceSettingsUseCase } from './application/use-cases/get-appearance-settings.usecase';
import { GetGestureSettingsUseCase } from './application/use-cases/get-gesture-settings.usecase';
import { GetNotificationSettingsUseCase } from './application/use-cases/get-notification-settings.usecase';
import { GetPrivacySettingsUseCase } from './application/use-cases/get-privacy-settings.usecase';
import { ResetSettingsToDefaultsUseCase } from './application/use-cases/reset-settings-to-defaults.usecase';
import { UpdateAccountSettingsUseCase } from './application/use-cases/update-account-settings.usecase';
import { UpdateAIBehaviourUseCase } from './application/use-cases/update-ai-behaviour.usecase';
import { UpdateAppearanceUseCase } from './application/use-cases/update-appearance.usecase';
import { UpdateCodeEditorUseCase } from './application/use-cases/update-code-editor.usecase';
import { UpdateCompilerUseCase } from './application/use-cases/update-compiler.usecase';
import { UpdateEmailDigestUseCase } from './application/use-cases/update-email-digest.usecase';
import { UpdateGesturesUseCase } from './application/use-cases/update-gestures.usecase';
import { UpdateLearningJourneyUseCase } from './application/use-cases/update-learning-journey.usecase';
import { UpdateNotificationsUseCase } from './application/use-cases/update-notifications.usecase';
import { UpdatePrivacyUseCase } from './application/use-cases/update-privacy.usecase';
import { UpdateQuietHoursUseCase } from './application/use-cases/update-quiet-hours.usecase';
import { mongoSettingsRepository } from './infrastructure/repositories/internal/mongo-settings-user.repository';

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
      getAllSettings: new GetAllSettingsUseCase(settingsRepository, settingsMapper),

      getAppearanceSettings: new GetAppearanceSettingsUseCase(settingsRepository, settingsMapper),

      getNotificationSettings: new GetNotificationSettingsUseCase(
        settingsRepository,
        settingsMapper
      ),

      getPrivacySettings: new GetPrivacySettingsUseCase(settingsRepository, settingsMapper),

      getGestureSettings: new GetGestureSettingsUseCase(settingsRepository, settingsMapper),

      updateAccountSettings: new UpdateAccountSettingsUseCase(settingsRepository, settingsMapper),

      updateAppearance: new UpdateAppearanceUseCase(settingsRepository, settingsMapper),

      updateNotifications: new UpdateNotificationsUseCase(settingsRepository, settingsMapper),

      updateQuietHours: new UpdateQuietHoursUseCase(settingsRepository, settingsMapper),

      updateEmailDigest: new UpdateEmailDigestUseCase(settingsRepository, settingsMapper),

      updatePrivacy: new UpdatePrivacyUseCase(settingsRepository, settingsMapper),

      updateCodeEditor: new UpdateCodeEditorUseCase(settingsRepository, settingsMapper),

      updateCompiler: new UpdateCompilerUseCase(settingsRepository, settingsMapper),

      updateAIBehaviour: new UpdateAIBehaviourUseCase(settingsRepository, settingsMapper),

      updateLearningJourney: new UpdateLearningJourneyUseCase(settingsRepository, settingsMapper),

      updateGestures: new UpdateGesturesUseCase(settingsRepository, settingsMapper),

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
