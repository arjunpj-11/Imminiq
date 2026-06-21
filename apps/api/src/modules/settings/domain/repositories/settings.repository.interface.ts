import type { SettingsCommandRepositoryContract } from './settings-command.repository.interface'
import type { SettingsQueryRepositoryContract } from './settings-query.repository.interface'

export interface SettingsRepositoryContract
  extends SettingsQueryRepositoryContract,
    SettingsCommandRepositoryContract {}

export type SettingsRepository = SettingsRepositoryContract

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