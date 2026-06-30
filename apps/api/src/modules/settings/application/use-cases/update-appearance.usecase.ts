import type { SettingsCommandRepositoryContract } from '../../domain/repositories/settings-command.repository.interface'
import type {
  UpdateAppearancePayload,
  UserSettingsView,
} from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type UpdateAppearanceRepository = {
  updateAppearance: SettingsCommandRepositoryContract['updateAppearance']
}

export class UpdateAppearanceUseCase {
  constructor(
    private readonly _settingsRepository: UpdateAppearanceRepository,
    private readonly _settingsMapper: SettingsMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: UpdateAppearancePayload,
  ): Promise<UserSettingsView | null> {
    const settings = await this._settingsRepository.updateAppearance({
      userId,
      data: payload,
    })

    return this._settingsMapper.toNullableDto(settings)
  }
}