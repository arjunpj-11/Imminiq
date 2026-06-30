import type { SettingsCommandRepositoryContract } from '../../domain/repositories/settings-command.repository.interface'
import type { SettingsQueryRepositoryContract } from '../../domain/repositories/settings-query.repository.interface'
import type {
  UpdateNotificationsPayload,
  UserSettingsView,
} from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type UpdateNotificationsRepository = {
  findOrCreate: SettingsQueryRepositoryContract['findOrCreate']
  updateNotifications: SettingsCommandRepositoryContract['updateNotifications']
  updateNotificationTypes: SettingsCommandRepositoryContract['updateNotificationTypes']
}

export class UpdateNotificationsUseCase {
  constructor(
    private readonly _settingsRepository: UpdateNotificationsRepository,
    private readonly _settingsMapper: SettingsMapperContract,
  ) {}

  async execute(
    userId: string,
    payload: UpdateNotificationsPayload,
  ): Promise<UserSettingsView> {
    const { types, ...rest } = payload

    if (Object.keys(rest).length > 0) {
      await this._settingsRepository.updateNotifications({
        userId,
        data: rest,
      })
    }

    if (types && Object.keys(types).length > 0) {
      await this._settingsRepository.updateNotificationTypes({
        userId,
        types,
      })
    }

    const settings = await this._settingsRepository.findOrCreate(userId)

    return this._settingsMapper.toDto(settings)
  }
}