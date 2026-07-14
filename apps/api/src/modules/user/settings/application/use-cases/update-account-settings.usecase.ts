import type { ISettingsCommandRepository } from '../../domain/repositories/settings-command.repository.interface';
import type { UpdateAccountPayloadDTO, UserSettingsViewDTO } from '../settings.dto';
import type { ISettingsMapper } from '../settings.mapper';

type UpdateAccountSettingsRepository = {
  updateAccountSettings: ISettingsCommandRepository['updateAccountSettings'];
};

export interface IUpdateAccountSettingsUseCase {
  execute(userId: string, payload: UpdateAccountPayloadDTO): Promise<UserSettingsViewDTO | null>;
}

export class UpdateAccountSettingsUseCase implements IUpdateAccountSettingsUseCase {
  constructor(
    private readonly _settingsRepository: UpdateAccountSettingsRepository,
    private readonly _settingsMapper: ISettingsMapper
  ) {}

  async execute(
    userId: string,
    payload: UpdateAccountPayloadDTO
  ): Promise<UserSettingsViewDTO | null> {
    const settings = await this._settingsRepository.updateAccountSettings({
      userId,
      data: payload,
    });

    return this._settingsMapper.toNullableDto(settings);
  }
}
