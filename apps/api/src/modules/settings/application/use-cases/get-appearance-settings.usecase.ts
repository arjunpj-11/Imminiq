import type { SettingsRepository } from '../../domain/repositories/settings.repository.interface'

export class GetAppearanceSettingsUseCase {
  constructor(
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(userId: string) {
    const settings = await this.settingsRepository.findOrCreate(userId)
    return settings.appearance
  }
}
