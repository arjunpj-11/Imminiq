import type { SettingsCommandRepositoryContract } from '../../domain/repositories/settings-command.repository.interface'
import type {
  UpdateLearningJourneyPayload,
  UserSettingsView,
} from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type UpdateLearningJourneyRepository = {
  updateLearningJourney: SettingsCommandRepositoryContract['updateLearningJourney']
}

export class UpdateLearningJourneyUseCase {
  constructor(
    private readonly settingsRepository: UpdateLearningJourneyRepository,
    private readonly settingsMapper: SettingsMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: UpdateLearningJourneyPayload,
  ): Promise<UserSettingsView | null> {
    const settings = await this.settingsRepository.updateLearningJourney({
      userId,
      data: payload,
    })

    return this.settingsMapper.toNullableDto(settings)
  }
}
