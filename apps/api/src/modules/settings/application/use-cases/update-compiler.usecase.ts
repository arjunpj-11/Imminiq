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
    private readonly settingsRepository: UpdateCompilerRepository,
    private readonly settingsMapper: SettingsMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: UpdateCompilerPayload,
  ): Promise<UserSettingsView | null> {
    const settings = await this.settingsRepository.updateCompiler(
      userId,
      payload,
    )
    return this.settingsMapper.toNullableDto(settings)
  }
}
