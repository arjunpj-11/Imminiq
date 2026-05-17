import type { SettingsRepository } from '../../domain/repositories/settings.repository.interface'

export class ResetSettingsToDefaultsUseCase {
  constructor(
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(userId: string) {
    return this.settingsRepository.resetToDefaults(userId)
  }
}
