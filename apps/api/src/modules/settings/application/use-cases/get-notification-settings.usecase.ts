import type { ISettingsQueryRepository } from '../../domain/repositories/settings-query.repository.interface'
import type { UserSettingsViewDTO } from '../dtos/settings.dto'
import type { ISettingsMapper } from '../mappers/settings.mapper'

type GetNotificationSettingsRepository = {
  findOrCreate: ISettingsQueryRepository['findOrCreate']
}

export class GetNotificationSettingsUseCase {
  constructor(
    private readonly _settingsRepository: GetNotificationSettingsRepository,
    private readonly _settingsMapper: ISettingsMapper,
  ) {}

  async execute(userId: string): Promise<UserSettingsViewDTO['notifications']> {
    const settings = await this._settingsRepository.findOrCreate(userId)
    return this._settingsMapper.toDto(settings).notifications
  }
}
