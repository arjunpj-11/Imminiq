export type {
  UpdateAppearancePayloadDTO,
  UpdateNotificationsPayloadDTO,
  UpdatePrivacyPayloadDTO,
  UserSettingsViewDTO,
} from './application/settings.dto';

export type { ThemeType } from './domain/settings.types';

export { createSettingsComposition } from './settings.factory';
export { createSettingsRoutes } from './presentation/settings.routes';
