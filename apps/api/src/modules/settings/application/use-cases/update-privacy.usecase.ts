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
    private readonly settingsRepository: UpdatePrivacyRepository,
    private readonly settingsMapper: SettingsMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: UpdatePrivacyPayload,
  ): Promise<UserSettingsView | null> {
    const settings = await this.settingsRepository.updatePrivacy(userId, payload)
    return this.settingsMapper.toNullableDto(settings)
  }
}
