import type { SettingsCommandRepositoryContract } from '../../domain/repositories/settings-command.repository.interface'
import type { UserSettingsView } from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type AcceptTermsRepository = {
  acceptTerms: SettingsCommandRepositoryContract['acceptTerms']
}

export class AcceptTermsUseCase {
  constructor(
    private readonly _settingsRepository: AcceptTermsRepository,
    private readonly _settingsMapper: SettingsMapperContract,
  ) {}

  async execute(userId: string): Promise<UserSettingsView | null> {
    const settings = await this._settingsRepository.acceptTerms(userId)
    return this._settingsMapper.toNullableDto(settings)
  }
}
