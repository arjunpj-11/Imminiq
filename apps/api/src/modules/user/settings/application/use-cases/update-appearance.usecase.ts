import type { ISettingsCommandRepository } from '../../domain/repositories/settings-command.repository.interface';
import type { UpdateAppearancePayloadDTO, UserSettingsViewDTO } from '../settings.dto';
import type { ISettingsMapper } from '../settings.mapper';

type UpdateAppearanceRepository = {
  updateAppearance: ISettingsCommandRepository['updateAppearance'];
};

export interface IUpdateAppearanceUseCase {
  execute(
    userId: string,
    payload: UpdateAppearancePayloadDTO
  ): Promise<UserSettingsViewDTO | null>;
}

export class UpdateAppearanceUseCase implements IUpdateAppearanceUseCase {
  constructor(
    private readonly _settingsRepository: UpdateAppearanceRepository,
    private readonly _settingsMapper: ISettingsMapper
  ) {}

  async execute(
    userId: string,
    payload: UpdateAppearancePayloadDTO
  ): Promise<UserSettingsViewDTO | null> {
    const settings = await this._settingsRepository.updateAppearance({
      userId,
      data: payload,
    });

    return this._settingsMapper.toNullableDto(settings);
  }
}
