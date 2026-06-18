import type { SettingsCommandRepositoryContract } from './settings-command.repository.interface'
import type { SettingsQueryRepositoryContract } from './settings-query.repository.interface'

export interface SettingsRepositoryContract
  extends SettingsQueryRepositoryContract,
    SettingsCommandRepositoryContract {}

export type SettingsRepository = SettingsRepositoryContract
