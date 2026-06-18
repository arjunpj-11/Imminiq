import type { SettingsCommandRepositoryContract } from '../../domain/repositories/settings-command.repository.interface'
import type {
  UpdateEmailDigestPayload,
  UserSettingsView,
} from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type UpdateEmailDigestRepository = {
  updateEmailDigest: SettingsCommandRepositoryContract['updateEmailDigest']
}

export class UpdateEmailDigestUseCase {
  constructor(
    private readonly settingsRepository: UpdateEmailDigestRepository,
    private readonly settingsMapper: SettingsMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: UpdateEmailDigestPayload,
  ): Promise<UserSettingsView | null> {
    const settings = await this.settingsRepository.updateEmailDigest(
      userId,
      payload,
    )
    return this.settingsMapper.toNullableDto(settings)
  }
}
