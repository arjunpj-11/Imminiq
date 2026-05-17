import type { SettingsRepository } from '../../domain/repositories/settings.repository.interface'
import type { UpdateGesturesPayload } from '../../domain/types/settings.types'

export class UpdateGesturesUseCase {
  constructor(
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(
    userId: string,
    payload: UpdateGesturesPayload
  ) {
    return this.settingsRepository.updateGestures(userId, payload)
  }
}
