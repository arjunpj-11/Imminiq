import type { SettingsRepository } from '../../domain/repositories/settings.repository.interface'
import type { UpdateAppearancePayload } from '../../domain/types/settings.types'

export class UpdateAppearanceUseCase {
  constructor(
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(
    userId: string,
    payload: UpdateAppearancePayload
  ) {
    return this.settingsRepository.updateAppearance(userId, payload)
  }
}
