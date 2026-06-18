import type { SettingsCommandRepositoryContract } from '../../domain/repositories/settings-command.repository.interface'
import type { UserSettingsView } from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type UpdateCookieConsentRepository = {
  updateCookieConsent: SettingsCommandRepositoryContract['updateCookieConsent']
}

export class UpdateCookieConsentUseCase {
  constructor(
    private readonly settingsRepository: UpdateCookieConsentRepository,
    private readonly settingsMapper: SettingsMapperContract,
  ) {}

  async execute(
    userId: string,
    cookieConsent: boolean,
  ): Promise<UserSettingsView | null> {
    const settings = await this.settingsRepository.updateCookieConsent(
      userId,
      cookieConsent,
    )
    return this.settingsMapper.toNullableDto(settings)
  }
}
