import type { ISettingsCommandRepository } from '../../domain/repositories/settings-command.repository.interface'
import type { UserSettingsViewDTO } from '../settings.dto'
import type { ISettingsMapper } from '../settings.mapper'

type ResetSettingsRepository = {
  resetToDefaults: ISettingsCommandRepository['resetToDefaults']
}

export interface IResetSettingsToDefaultsUseCase {
  execute(userId: string): Promise<UserSettingsViewDTO>
}

export class ResetSettingsToDefaultsUseCase implements IResetSettingsToDefaultsUseCase {
  constructor(
    private readonly _settingsRepository: ResetSettingsRepository,
    private readonly _settingsMapper: ISettingsMapper,
  ) {}

  async execute(userId: string): Promise<UserSettingsViewDTO> {
    const settings = await this._settingsRepository.resetToDefaults(userId)
    return this._settingsMapper.toDto(settings)
  }
}
