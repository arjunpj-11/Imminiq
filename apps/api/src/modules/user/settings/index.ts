export type {
  UpdateAccountPayloadDTO,
  UpdateAIBehaviourPayloadDTO,
  UpdateAppearancePayloadDTO,
  UpdateCodeEditorPayloadDTO,
  UpdateCompilerPayloadDTO,
  UpdateEmailDigestPayloadDTO,
  UpdateGesturesPayloadDTO,
  UpdateLearningJourneyPayloadDTO,
  UpdateNotificationsPayloadDTO,
  UpdatePrivacyPayloadDTO,
  UpdateQuietHoursPayloadDTO,
  UserSettingsViewDTO,
} from './application/settings.dto';

export type {
  AIResponseStyleType,
  DigestFrequencyType,
  MessagePermissionType,
  ProfileVisibilityType,
  QuietHoursDayType,
  ThemeType,
} from './domain/settings.types';

export { createSettingsComposition } from './settings.factory';
export { settingsRoutes } from './presentation/settings.routes';
