import type { SettingsCommandRepositoryContract } from '../../domain/repositories/settings-command.repository.interface'
import type {
  UpdateAIBehaviourPayload,
  UserSettingsView,
} from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type UpdateAIBehaviourRepository = {
  updateAIBehaviour: SettingsCommandRepositoryContract['updateAIBehaviour']
}

export class UpdateAIBehaviourUseCase {
  constructor(
    private readonly _settingsRepository: UpdateAIBehaviourRepository,
    private readonly _settingsMapper: SettingsMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: UpdateAIBehaviourPayload,
  ): Promise<UserSettingsView | null> {
    const settings = await this._settingsRepository.updateAIBehaviour({
      userId,
      data: payload,
    })

    return this._settingsMapper.toNullableDto(settings)
  }
}