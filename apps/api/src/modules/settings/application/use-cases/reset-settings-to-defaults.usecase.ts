import type { SettingsCommandRepositoryContract } from '../../domain/repositories/settings-command.repository.interface'
import type { UserSettingsView } from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type ResetSettingsRepository = {
  resetToDefaults: SettingsCommandRepositoryContract['resetToDefaults']
}

export class ResetSettingsToDefaultsUseCase {
  constructor(
    private readonly settingsRepository: ResetSettingsRepository,
    private readonly settingsMapper: SettingsMapperContract,
  ) {}

  async execute(userId: string): Promise<UserSettingsView> {
    const settings = await this.settingsRepository.resetToDefaults(userId)
    return this.settingsMapper.toDto(settings)
  }
}
