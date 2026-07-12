import type { ISettingsQueryRepository } from '../../domain/repositories/settings-query.repository.interface'
import type { UserSettingsViewDTO } from '../dtos/settings.dto'
import type { ISettingsMapper } from '../mappers/settings.mapper'

type GetAppearanceSettingsRepository = {
  findOrCreate: ISettingsQueryRepository['findOrCreate']
}

export class GetAppearanceSettingsUseCase {
  constructor(
    private readonly _settingsRepository: GetAppearanceSettingsRepository,
    private readonly _settingsMapper: ISettingsMapper,
  ) {}

  async execute(userId: string): Promise<UserSettingsViewDTO['appearance']> {
    const settings = await this._settingsRepository.findOrCreate(userId)
    return this._settingsMapper.toDto(settings).appearance
  }
}
