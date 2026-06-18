import type { SettingsCommandRepositoryContract } from '../../domain/repositories/settings-command.repository.interface'
import type { UserSettingsView } from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type AcceptTermsRepository = {
  acceptTerms: SettingsCommandRepositoryContract['acceptTerms']
}

export class AcceptTermsUseCase {
  constructor(
    private readonly settingsRepository: AcceptTermsRepository,
    private readonly settingsMapper: SettingsMapperContract,
  ) {}

  async execute(userId: string): Promise<UserSettingsView | null> {
    const settings = await this.settingsRepository.acceptTerms(userId)
    return this.settingsMapper.toNullableDto(settings)
  }
}
