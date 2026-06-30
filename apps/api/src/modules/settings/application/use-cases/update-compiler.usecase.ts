import type { SettingsCommandRepositoryContract } from '../../domain/repositories/settings-command.repository.interface'
import type {
  UpdateCompilerPayload,
  UserSettingsView,
} from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type UpdateCompilerRepository = {
  updateCompiler: SettingsCommandRepositoryContract['updateCompiler']
}

export class UpdateCompilerUseCase {
  constructor(
    private readonly _settingsRepository: UpdateCompilerRepository,
    private readonly _settingsMapper: SettingsMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: UpdateCompilerPayload,
  ): Promise<UserSettingsView | null> {
    const settings = await this._settingsRepository.updateCompiler({
      userId,
      data: payload,
    })

    return this._settingsMapper.toNullableDto(settings)
  }
}