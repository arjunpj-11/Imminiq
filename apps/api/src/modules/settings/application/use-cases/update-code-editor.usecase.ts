import type { SettingsCommandRepositoryContract } from '../../domain/repositories/settings-command.repository.interface'
import type {
  UpdateCodeEditorPayload,
  UserSettingsView,
} from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type UpdateCodeEditorRepository = {
  updateCodeEditor: SettingsCommandRepositoryContract['updateCodeEditor']
}

export class UpdateCodeEditorUseCase {
  constructor(
    private readonly _settingsRepository: UpdateCodeEditorRepository,
    private readonly _settingsMapper: SettingsMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: UpdateCodeEditorPayload,
  ): Promise<UserSettingsView | null> {
    const settings = await this._settingsRepository.updateCodeEditor({
      userId,
      data: payload,
    })

    return this._settingsMapper.toNullableDto(settings)
  }
}