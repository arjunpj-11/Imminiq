import type { ISettingsCommandRepository } from '../../domain/repositories/settings-command.repository.interface';
import type { ISettingsQueryRepository } from '../../domain/repositories/settings-query.repository.interface';
import type { UpdateNotificationsPayloadDTO, UserSettingsViewDTO } from '../settings.dto';
import type { ISettingsMapper } from '../settings.mapper';

type UpdateNotificationsRepository = {
  findOrCreate: ISettingsQueryRepository['findOrCreate'];
  updateNotifications: ISettingsCommandRepository['updateNotifications'];
  updateNotificationTypes: ISettingsCommandRepository['updateNotificationTypes'];
};

export interface IUpdateNotificationsUseCase {
  execute(userId: string, payload: UpdateNotificationsPayloadDTO): Promise<UserSettingsViewDTO>;
}

export class UpdateNotificationsUseCase implements IUpdateNotificationsUseCase {
  constructor(
    private readonly _settingsRepository: UpdateNotificationsRepository,
    private readonly _settingsMapper: ISettingsMapper
  ) {}

  async execute(
    userId: string,
    payload: UpdateNotificationsPayloadDTO
  ): Promise<UserSettingsViewDTO> {
    const { types, ...rest } = payload;

    if (Object.keys(rest).length > 0) {
      await this._settingsRepository.updateNotifications({
        userId,
        data: rest,
      });
    }

    if (types && Object.keys(types).length > 0) {
      await this._settingsRepository.updateNotificationTypes({
        userId,
        types,
      });
    }

    const settings = await this._settingsRepository.findOrCreate(userId);

    return this._settingsMapper.toDto(settings);
  }
}
