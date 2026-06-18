import type { UserSettingsEntity } from '../../domain/entities/user-settings.entity'
import type { UserSettingsView } from '../dtos/settings.dto'

export interface SettingsMapperContract {
  toDto(settings: UserSettingsEntity): UserSettingsView
  toNullableDto(settings: UserSettingsEntity | null): UserSettingsView | null
}

export class SettingsMapper implements SettingsMapperContract {
  toDto(settings: UserSettingsEntity): UserSettingsView {
    return settings.settings
  }

  toNullableDto(settings: UserSettingsEntity | null): UserSettingsView | null {
    return settings ? this.toDto(settings) : null
  }
}
