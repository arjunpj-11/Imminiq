import type { SettingsCommandRepositoryContract } from '../../domain/repositories/settings-command.repository.interface'
import type { UserSettingsView } from '../dtos/settings.dto'
import type { SettingsMapperContract } from '../mappers/settings.mapper'

type UpdateCookieConsentRepository = {
  updateCookieConsent: SettingsCommandRepositoryContract['updateCookieConsent']
}

export class UpdateCookieConsentUseCase {
  constructor(
    private readonly _settingsRepository: UpdateCookieConsentRepository,
    private readonly _settingsMapper: SettingsMapperContract,
  ) {}

  async execute(
    userId: string,
    cookieConsent: boolean,
  ): Promise<UserSettingsView | null> {
    const settings = await this._settingsRepository.updateCookieConsent({
      userId,
      cookieConsent,
    })

    return this._settingsMapper.toNullableDto(settings)
  }
}