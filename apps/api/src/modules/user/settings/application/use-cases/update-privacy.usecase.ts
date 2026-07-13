import type { ISettingsCommandRepository } from '../../domain/repositories/settings-command.repository.interface';
import type { IUpdatePrivacyPayloadDTO, UserSettingsViewDTO } from '../settings.dto';
import type { ISettingsMapper } from '../settings.mapper';

type UpdatePrivacyRepository = {
  updatePrivacy: ISettingsCommandRepository['updatePrivacy'];
};

export interface IUpdatePrivacyUseCase {
  execute(userId: string, payload: IUpdatePrivacyPayloadDTO): Promise<UserSettingsViewDTO | null>;
}

export class UpdatePrivacyUseCase implements IUpdatePrivacyUseCase {
  constructor(
    private readonly _settingsRepository: UpdatePrivacyRepository,
    private readonly _settingsMapper: ISettingsMapper
  ) {}

  async execute(
    userId: string,
    payload: IUpdatePrivacyPayloadDTO
  ): Promise<UserSettingsViewDTO | null> {
    const settings = await this._settingsRepository.updatePrivacy({
      userId,
      data: payload,
    });

    return this._settingsMapper.toNullableDto(settings);
  }
}
