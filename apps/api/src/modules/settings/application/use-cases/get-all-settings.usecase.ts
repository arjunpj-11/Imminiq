import type { SettingsQueryRepositoryContract } from '../../domain/repositories/settings-query.repository.interface'
import type { UserSettingsView } from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type GetAllSettingsRepository = {
  findOrCreate: SettingsQueryRepositoryContract['findOrCreate']
}

export class GetAllSettingsUseCase {
  constructor(
    private readonly settingsRepository: GetAllSettingsRepository,
    private readonly settingsMapper: SettingsMapperContract,
  ) {}

  async execute(userId: string): Promise<UserSettingsView> {
    const settings = await this.settingsRepository.findOrCreate(userId)
    return this.settingsMapper.toDto(settings)
  }
}
