import type { SettingsCommandRepositoryContract } from '../../domain/repositories/settings-command.repository.interface'
import type {
  UpdateAccountPayload,
  UserSettingsView,
} from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type UpdateAccountSettingsRepository = {
  updateAccountSettings: SettingsCommandRepositoryContract['updateAccountSettings']
}

export class UpdateAccountSettingsUseCase {
  constructor(
    private readonly settingsRepository: UpdateAccountSettingsRepository,
    private readonly settingsMapper: SettingsMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: UpdateAccountPayload,
  ): Promise<UserSettingsView | null> {
    const settings = await this.settingsRepository.updateAccountSettings({
      userId,
      data: payload,
    })

    return this.settingsMapper.toNullableDto(settings)
  }
}