import type { SettingsRepository } from '../../domain/repositories/settings.repository.interface'

export class GetNotificationSettingsUseCase {
  constructor(
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(userId: string) {
    const settings = await this.settingsRepository.findOrCreate(userId)
    return settings.notifications
  }
}
