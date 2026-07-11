import type { ISettingsQueryRepository } from '../../domain/repositories/settings-query.repository.interface'
import type { UserSettingsViewDTO } from '../dtos/settings.dto'
import type { ISettingsMapper } from '../mappers/settings.mapper'

type GetPrivacySettingsRepository = {
  findOrCreate: ISettingsQueryRepository['findOrCreate']
}

export class GetPrivacySettingsUseCase {
  constructor(
    private readonly _settingsRepository: GetPrivacySettingsRepository,
    private readonly _settingsMapper: ISettingsMapper,
  ) {}

  async execute(userId: string): Promise<UserSettingsViewDTO['privacy']> {
    const settings = await this._settingsRepository.findOrCreate(userId)
    return this._settingsMapper.toDto(settings).privacy
  }
}
