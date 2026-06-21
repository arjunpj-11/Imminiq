import type { SettingsQueryRepositoryContract } from '../../domain/repositories/settings-query.repository.interface'
import type { UserSettingsView } from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type GetNotificationSettingsRepository = {
  findOrCreate: SettingsQueryRepositoryContract['findOrCreate']
}

export class GetNotificationSettingsUseCase {
  constructor(
    private readonly settingsRepository: GetNotificationSettingsRepository,
    private readonly settingsMapper: SettingsMapperContract,
  ) {}

  async execute(userId: string): Promise<UserSettingsView['notifications']> {
    const settings = await this.settingsRepository.findOrCreate(userId)
    return this.settingsMapper.toDto(settings).notifications
  }
}
