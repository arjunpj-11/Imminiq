import type { ISettingsCommandRepository } from '../../domain/repositories/settings-command.repository.interface'
import type {
  IUpdateAppearancePayloadDTO,
  UserSettingsViewDTO,
} from '../dtos/settings.dto'
import type { ISettingsMapper } from '../mappers/settings.mapper'

type UpdateAppearanceRepository = {
  updateAppearance: ISettingsCommandRepository['updateAppearance']
}

export class UpdateAppearanceUseCase {
  constructor(
    private readonly _settingsRepository: UpdateAppearanceRepository,
    private readonly _settingsMapper: ISettingsMapper,
  ) {}

  async execute(
    userId: string,
    payload: IUpdateAppearancePayloadDTO,
  ): Promise<UserSettingsViewDTO | null> {
    const settings = await this._settingsRepository.updateAppearance({
      userId,
      data: payload,
    })

    return this._settingsMapper.toNullableDto(settings)
  }
}