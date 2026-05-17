import type { SettingsRepository } from '../../domain/repositories/settings.repository.interface'
import type { UpdateLearningJourneyPayload } from '../../domain/types/settings.types'

export class UpdateLearningJourneyUseCase {
  constructor(
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(
    userId: string,
    payload: UpdateLearningJourneyPayload
  ) {
    return this.settingsRepository.updateLearningJourney(userId, payload)
  }
}
