import type { ISettingsQueryRepository } from '../../domain/repositories/settings-query.repository.interface'
import type { UserSettingsViewDTO } from '../dtos/settings.dto'
import type { ISettingsMapper } from '../mappers/settings.mapper'

type GetGestureSettingsRepository = {
  findOrCreate: ISettingsQueryRepository['findOrCreate']
}

export interface IGetGestureSettingsUseCase {
  execute(userId: string): Promise<UserSettingsViewDTO['gestures']>
}

export class GetGestureSettingsUseCase implements IGetGestureSettingsUseCase {
  constructor(
    private readonly _settingsRepository: GetGestureSettingsRepository,
    private readonly _settingsMapper: ISettingsMapper,
  ) {}

  async execute(userId: string): Promise<UserSettingsViewDTO['gestures']> {
    const settings = await this._settingsRepository.findOrCreate(userId)
    return this._settingsMapper.toDto(settings).gestures
  }
}
