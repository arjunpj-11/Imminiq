import type { SettingsQueryRepositoryContract } from '../../domain/repositories/settings-query.repository.interface'
import type { UserSettingsView } from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type GetAppearanceSettingsRepository = {
  findOrCreate: SettingsQueryRepositoryContract['findOrCreate']
}

export class GetAppearanceSettingsUseCase {
  constructor(
    private readonly settingsRepository: GetAppearanceSettingsRepository,
    private readonly settingsMapper: SettingsMapperContract,
  ) {}

  async execute(userId: string): Promise<UserSettingsView['appearance']> {
    const settings = await this.settingsRepository.findOrCreate(userId)
    return this.settingsMapper.toDto(settings).appearance
  }
}
