import type { ISettingsCommandRepository } from '../../domain/repositories/settings-command.repository.interface'
import type {
  IUpdateCompilerPayloadDTO,
  UserSettingsViewDTO,
} from '../dtos/settings.dto'
import type { ISettingsMapper } from '../mappers/settings.mapper'

type UpdateCompilerRepository = {
  updateCompiler: ISettingsCommandRepository['updateCompiler']
}

export class UpdateCompilerUseCase {
  constructor(
    private readonly _settingsRepository: UpdateCompilerRepository,
    private readonly _settingsMapper: ISettingsMapper,
  ) {}

  async execute(
    userId: string,
    payload: IUpdateCompilerPayloadDTO,
  ): Promise<UserSettingsViewDTO | null> {
    const settings = await this._settingsRepository.updateCompiler({
      userId,
      data: payload,
    })

    return this._settingsMapper.toNullableDto(settings)
  }
}