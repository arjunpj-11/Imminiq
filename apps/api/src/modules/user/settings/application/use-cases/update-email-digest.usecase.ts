import type { ISettingsCommandRepository } from '../../domain/repositories/settings-command.repository.interface';
import type { UpdateEmailDigestPayloadDTO, UserSettingsViewDTO } from '../settings.dto';
import type { ISettingsMapper } from '../settings.mapper';

type UpdateEmailDigestRepository = {
  updateEmailDigest: ISettingsCommandRepository['updateEmailDigest'];
};

export interface IUpdateEmailDigestUseCase {
  execute(
    userId: string,
    payload: UpdateEmailDigestPayloadDTO
  ): Promise<UserSettingsViewDTO | null>;
}

export class UpdateEmailDigestUseCase implements IUpdateEmailDigestUseCase {
  constructor(
    private readonly _settingsRepository: UpdateEmailDigestRepository,
    private readonly _settingsMapper: ISettingsMapper
  ) {}

  async execute(
    userId: string,
    payload: UpdateEmailDigestPayloadDTO
  ): Promise<UserSettingsViewDTO | null> {
    const settings = await this._settingsRepository.updateEmailDigest({
      userId,
      data: payload,
    });

    return this._settingsMapper.toNullableDto(settings);
  }
}
