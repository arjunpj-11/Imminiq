import type { SettingsQueryRepositoryContract } from '../../domain/repositories/settings-query.repository.interface'
import type { UserSettingsView } from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type GetGestureSettingsRepository = {
  findOrCreate: SettingsQueryRepositoryContract['findOrCreate']
}

export class GetGestureSettingsUseCase {
  constructor(
    private readonly settingsRepository: GetGestureSettingsRepository,
    private readonly settingsMapper: SettingsMapperContract,
  ) {}

  async execute(userId: string): Promise<UserSettingsView['gestures']> {
    const settings = await this.settingsRepository.findOrCreate(userId)
    return this.settingsMapper.toDto(settings).gestures
  }
}
