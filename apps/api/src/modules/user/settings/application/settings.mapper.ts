import type { UserSettingsEntity } from '../domain/entities/user-settings.entity'
import type { UserSettingsViewDTO } from './settings.dto'

export interface ISettingsMapper {
  toDto(settings: UserSettingsEntity): UserSettingsViewDTO
  toNullableDto(settings: UserSettingsEntity | null): UserSettingsViewDTO | null
}

export class SettingsMapper implements ISettingsMapper {
  toDto(settings: UserSettingsEntity): UserSettingsViewDTO {
    return settings.settings
  }

  toNullableDto(settings: UserSettingsEntity | null): UserSettingsViewDTO | null {
    return settings ? this.toDto(settings) : null
  }
}
