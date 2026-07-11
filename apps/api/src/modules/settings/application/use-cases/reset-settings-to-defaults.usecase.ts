import type { ISettingsCommandRepository } from '../../domain/repositories/settings-command.repository.interface'
import type { UserSettingsViewDTO } from '../dtos/settings.dto'
import type { ISettingsMapper } from '../mappers/settings.mapper'

type ResetSettingsRepository = {
  resetToDefaults: ISettingsCommandRepository['resetToDefaults']
}

export class ResetSettingsToDefaultsUseCase {
  constructor(
    private readonly _settingsRepository: ResetSettingsRepository,
    private readonly _settingsMapper: ISettingsMapper,
  ) {}

  async execute(userId: string): Promise<UserSettingsViewDTO> {
    const settings = await this._settingsRepository.resetToDefaults(userId)
    return this._settingsMapper.toDto(settings)
  }
}
