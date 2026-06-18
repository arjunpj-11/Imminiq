import type { SettingsCommandRepositoryContract } from '../../domain/repositories/settings-command.repository.interface'
import type {
  UpdateQuietHoursPayload,
  UserSettingsView,
} from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type UpdateQuietHoursRepository = {
  updateQuietHours: SettingsCommandRepositoryContract['updateQuietHours']
}

export class UpdateQuietHoursUseCase {
  constructor(
    private readonly settingsRepository: UpdateQuietHoursRepository,
    private readonly settingsMapper: SettingsMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: UpdateQuietHoursPayload,
  ): Promise<UserSettingsView | null> {
    const settings = await this.settingsRepository.updateQuietHours(
      userId,
      payload,
    )
    return this.settingsMapper.toNullableDto(settings)
  }
}
