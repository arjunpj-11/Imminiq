import type { SettingsCommandRepositoryContract } from '../../domain/repositories/settings-command.repository.interface'
import type {
  UpdateGesturesPayload,
  UserSettingsView,
} from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type UpdateGesturesRepository = {
  updateGestures: SettingsCommandRepositoryContract['updateGestures']
}

export class UpdateGesturesUseCase {
  constructor(
    private readonly settingsRepository: UpdateGesturesRepository,
    private readonly settingsMapper: SettingsMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: UpdateGesturesPayload,
  ): Promise<UserSettingsView | null> {
    const settings = await this.settingsRepository.updateGestures(
      userId,
      payload,
    )
    return this.settingsMapper.toNullableDto(settings)
  }
}
