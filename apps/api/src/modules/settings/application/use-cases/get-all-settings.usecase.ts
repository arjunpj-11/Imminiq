import type { SettingsRepository } from '../../domain/repositories/settings.repository.interface'

export class GetAllSettingsUseCase {
  constructor(
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(userId: string) {
    return this.settingsRepository.findOrCreate(userId)
  }
}
