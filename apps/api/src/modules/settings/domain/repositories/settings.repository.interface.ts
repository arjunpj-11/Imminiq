import type { ISettingsCommandRepository } from './settings-command.repository.interface'
import type { ISettingsQueryRepository } from './settings-query.repository.interface'

export interface ISettingsRepository
  extends ISettingsQueryRepository,
    ISettingsCommandRepository {}

export type SettingsRepository = ISettingsRepository

export type {
  SettingsAIBehaviourUpdateInput,
  SettingsAccountUpdateInput,
  SettingsAppearanceUpdateInput,
  SettingsCodeEditorUpdateInput,
  SettingsCompilerUpdateInput,
  SettingsEmailDigestUpdateInput,
  SettingsGesturesUpdateInput,
  SettingsLearningJourneyUpdateInput,
  SettingsNotificationTypesUpdateInput,
  SettingsNotificationsUpdateInput,
  SettingsPrivacyUpdateInput,
  SettingsQuietHoursUpdateInput,
  UpdateSettingsAIBehaviourInput,
  UpdateSettingsAccountInput,
  UpdateSettingsAppearanceInput,
  UpdateSettingsCodeEditorInput,
  UpdateSettingsCompilerInput,
  UpdateSettingsCookieConsentInput,
  UpdateSettingsEmailDigestInput,
  UpdateSettingsGesturesInput,
  UpdateSettingsLearningJourneyInput,
  UpdateSettingsNotificationTypesInput,
  UpdateSettingsNotificationsInput,
  UpdateSettingsPrivacyInput,
  UpdateSettingsQuietHoursInput,
} from './settings-command.repository.interface'