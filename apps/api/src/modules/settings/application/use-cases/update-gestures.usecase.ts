import type { ISettingsCommandRepository } from '../../domain/repositories/settings-command.repository.interface'
import type {
  IUpdateGesturesPayloadDTO,
  UserSettingsViewDTO,
} from '../dtos/settings.dto'
import type { ISettingsMapper } from '../mappers/settings.mapper'

type UpdateGesturesRepository = {
  updateGestures: ISettingsCommandRepository['updateGestures']
}

export interface IUpdateGesturesUseCase {
  execute(userId: string, payload: IUpdateGesturesPayloadDTO): Promise<UserSettingsViewDTO | null>
}

export class UpdateGesturesUseCase implements IUpdateGesturesUseCase {
  constructor(
    private readonly _settingsRepository: UpdateGesturesRepository,
    private readonly _settingsMapper: ISettingsMapper,
  ) {}

  async execute(
    userId: string,
    payload: IUpdateGesturesPayloadDTO,
  ): Promise<UserSettingsViewDTO | null> {
    const settings = await this._settingsRepository.updateGestures({
      userId,
      data: payload,
    })

    return this._settingsMapper.toNullableDto(settings)
  }
}