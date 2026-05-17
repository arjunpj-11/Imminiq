import type { SettingsRepository } from '../../domain/repositories/settings.repository.interface'
import type { UpdateQuietHoursPayload } from '../../domain/types/settings.types'

export class UpdateQuietHoursUseCase {
  constructor(
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(
    userId: string,
    payload: UpdateQuietHoursPayload
  ) {
    return this.settingsRepository.updateQuietHours(userId, payload)
  }
}
