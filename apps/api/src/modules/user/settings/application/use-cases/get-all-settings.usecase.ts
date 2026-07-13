import type { ISettingsQueryRepository } from '../../domain/repositories/settings-query.repository.interface';
import type { UserSettingsViewDTO } from '../settings.dto';
import type { ISettingsMapper } from '../settings.mapper';

type GetAllSettingsRepository = {
  findOrCreate: ISettingsQueryRepository['findOrCreate'];
};

export interface IGetAllSettingsUseCase {
  execute(userId: string): Promise<UserSettingsViewDTO>;
}

export class GetAllSettingsUseCase implements IGetAllSettingsUseCase {
  constructor(
    private readonly _settingsRepository: GetAllSettingsRepository,
    private readonly _settingsMapper: ISettingsMapper
  ) {}

  async execute(userId: string): Promise<UserSettingsViewDTO> {
    const settings = await this._settingsRepository.findOrCreate(userId);
    return this._settingsMapper.toDto(settings);
  }
}
