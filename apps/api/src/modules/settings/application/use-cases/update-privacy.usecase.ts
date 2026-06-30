import type { SettingsCommandRepositoryContract } from '../../domain/repositories/settings-command.repository.interface'
import type {
  UpdatePrivacyPayload,
  UserSettingsView,
} from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type UpdatePrivacyRepository = {
  updatePrivacy: SettingsCommandRepositoryContract['updatePrivacy']
}

export class UpdatePrivacyUseCase {
  constructor(
    private readonly _settingsRepository: UpdatePrivacyRepository,
    private readonly _settingsMapper: SettingsMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: UpdatePrivacyPayload,
  ): Promise<UserSettingsView | null> {
    const settings = await this._settingsRepository.updatePrivacy({
      userId,
      data: payload,
    })

    return this._settingsMapper.toNullableDto(settings)
  }
}