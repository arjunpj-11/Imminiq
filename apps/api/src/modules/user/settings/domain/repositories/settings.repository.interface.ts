import type { ISettingsCommandRepository } from './settings-command.repository.interface';
import type { ISettingsQueryRepository } from './settings-query.repository.interface';

export interface ISettingsRepository extends ISettingsQueryRepository, ISettingsCommandRepository {}

export type SettingsRepository = ISettingsRepository;

export type {
  SettingsAppearanceUpdateInput,
  SettingsNotificationsUpdateInput,
  SettingsPrivacyUpdateInput,
  UpdateSettingsAppearanceInput,
  UpdateSettingsNotificationTypesInput,
  UpdateSettingsNotificationsInput,
  UpdateSettingsPrivacyInput,
} from './settings-command.repository.interface';
