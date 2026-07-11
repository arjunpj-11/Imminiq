import type { ISettingsCommandRepository } from '../../domain/repositories/settings-command.repository.interface'
import type { UserSettingsViewDTO } from '../dtos/settings.dto'
import type { ISettingsMapper } from '../mappers/settings.mapper'

type AcceptTermsRepository = {
  acceptTerms: ISettingsCommandRepository['acceptTerms']
}

export class AcceptTermsUseCase {
  constructor(
    private readonly _settingsRepository: AcceptTermsRepository,
    private readonly _settingsMapper: ISettingsMapper,
  ) {}

  async execute(userId: string): Promise<UserSettingsViewDTO | null> {
    const settings = await this._settingsRepository.acceptTerms(userId)
    return this._settingsMapper.toNullableDto(settings)
  }
}
