import type { SettingsRepository } from '../../domain/repositories/settings.repository.interface'
import type { UpdateNotificationsPayload } from '../../domain/types/settings.types'

export class UpdateNotificationsUseCase {
  constructor(
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(
    userId: string,
    payload: UpdateNotificationsPayload
  ) {
    const { types, ...rest } = payload

    if (Object.keys(rest).length > 0) {
      await this.settingsRepository.updateNotifications(userId, rest)
    }

    if (types && Object.keys(types).length > 0) {
      await this.settingsRepository.updateNotificationTypes(userId, types)
    }

    return this.settingsRepository.findOrCreate(userId)
  }
}
