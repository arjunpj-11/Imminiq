import type { ISettingsCommandRepository } from '../../domain/repositories/settings-command.repository.interface'
import type {
  IUpdateCodeEditorPayloadDTO,
  UserSettingsViewDTO,
} from '../dtos/settings.dto'
import type { ISettingsMapper } from '../mappers/settings.mapper'

type UpdateCodeEditorRepository = {
  updateCodeEditor: ISettingsCommandRepository['updateCodeEditor']
}

export class UpdateCodeEditorUseCase {
  constructor(
    private readonly _settingsRepository: UpdateCodeEditorRepository,
    private readonly _settingsMapper: ISettingsMapper,
  ) {}

  async execute(
    userId: string,
    payload: IUpdateCodeEditorPayloadDTO,
  ): Promise<UserSettingsViewDTO | null> {
    const settings = await this._settingsRepository.updateCodeEditor({
      userId,
      data: payload,
    })

    return this._settingsMapper.toNullableDto(settings)
  }
}