import type { ISettingsQueryRepository } from '../../domain/repositories/settings-query.repository.interface';
import type { UserSettingsViewDTO } from '../settings.dto';
import type { ISettingsMapper } from '../settings.mapper';

type GetAppearanceSettingsRepository = {
  findOrCreate: ISettingsQueryRepository['findOrCreate'];
};

export interface IGetAppearanceSettingsUseCase {
  execute(userId: string): Promise<UserSettingsViewDTO['appearance']>;
}

export class GetAppearanceSettingsUseCase implements IGetAppearanceSettingsUseCase {
  constructor(
    private readonly _settingsRepository: GetAppearanceSettingsRepository,
    private readonly _settingsMapper: ISettingsMapper
  ) {}

  async execute(userId: string): Promise<UserSettingsViewDTO['appearance']> {
    const settings = await this._settingsRepository.findOrCreate(userId);
    return this._settingsMapper.toDto(settings).appearance;
  }
}
