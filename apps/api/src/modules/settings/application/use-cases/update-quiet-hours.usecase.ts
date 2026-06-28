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
    private readonly _settingsRepository: UpdateQuietHoursRepository,
    private readonly _settingsMapper: SettingsMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: UpdateQuietHoursPayload,
  ): Promise<UserSettingsView | null> {
    const settings = await this._settingsRepository.updateQuietHours({
      userId,
      data: payload,
    })

    return this._settingsMapper.toNullableDto(settings)
  }
}