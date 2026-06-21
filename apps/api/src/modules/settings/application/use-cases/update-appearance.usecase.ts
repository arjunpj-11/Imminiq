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
    private readonly settingsRepository: UpdateAppearanceRepository,
    private readonly settingsMapper: SettingsMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: UpdateAppearancePayload,
  ): Promise<UserSettingsView | null> {
    const settings = await this.settingsRepository.updateAppearance({
      userId,
      data: payload,
    })

    return this.settingsMapper.toNullableDto(settings)
  }
}