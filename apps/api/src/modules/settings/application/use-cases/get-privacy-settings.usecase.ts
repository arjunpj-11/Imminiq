import type { SettingsQueryRepositoryContract } from '../../domain/repositories/settings-query.repository.interface'
import type { UserSettingsView } from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type GetPrivacySettingsRepository = {
  findOrCreate: SettingsQueryRepositoryContract['findOrCreate']
}

export class GetPrivacySettingsUseCase {
  constructor(
    private readonly settingsRepository: GetPrivacySettingsRepository,
    private readonly settingsMapper: SettingsMapperContract,
  ) {}

  async execute(userId: string): Promise<UserSettingsView['privacy']> {
    const settings = await this.settingsRepository.findOrCreate(userId)
    return this.settingsMapper.toDto(settings).privacy
  }
}
