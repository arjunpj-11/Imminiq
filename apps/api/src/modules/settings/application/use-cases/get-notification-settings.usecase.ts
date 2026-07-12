import type { ISettingsQueryRepository } from '../../domain/repositories/settings-query.repository.interface'
import type { UserSettingsViewDTO } from '../settings.dto'
import type { ISettingsMapper } from '../settings.mapper'

type GetNotificationSettingsRepository = {
  findOrCreate: ISettingsQueryRepository['findOrCreate']
}

export interface IGetNotificationSettingsUseCase {
  execute(userId: string): Promise<UserSettingsViewDTO['notifications']>
}

export class GetNotificationSettingsUseCase implements IGetNotificationSettingsUseCase {
  constructor(
    private readonly _settingsRepository: GetNotificationSettingsRepository,
    private readonly _settingsMapper: ISettingsMapper,
  ) {}

  async execute(userId: string): Promise<UserSettingsViewDTO['notifications']> {
    const settings = await this._settingsRepository.findOrCreate(userId)
    return this._settingsMapper.toDto(settings).notifications
  }
}
