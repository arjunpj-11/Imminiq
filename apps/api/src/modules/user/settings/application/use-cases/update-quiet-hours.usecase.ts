import type { ISettingsCommandRepository } from '../../domain/repositories/settings-command.repository.interface';
import type { UpdateQuietHoursPayloadDTO, UserSettingsViewDTO } from '../settings.dto';
import type { ISettingsMapper } from '../settings.mapper';

type UpdateQuietHoursRepository = {
  updateQuietHours: ISettingsCommandRepository['updateQuietHours'];
};

export interface IUpdateQuietHoursUseCase {
  execute(
    userId: string,
    payload: UpdateQuietHoursPayloadDTO
  ): Promise<UserSettingsViewDTO | null>;
}

export class UpdateQuietHoursUseCase implements IUpdateQuietHoursUseCase {
  constructor(
    private readonly _settingsRepository: UpdateQuietHoursRepository,
    private readonly _settingsMapper: ISettingsMapper
  ) {}

  async execute(
    userId: string,
    payload: UpdateQuietHoursPayloadDTO
  ): Promise<UserSettingsViewDTO | null> {
    const settings = await this._settingsRepository.updateQuietHours({
      userId,
      data: payload,
    });

    return this._settingsMapper.toNullableDto(settings);
  }
}
