import type { ISettingsCommandRepository } from '../../domain/repositories/settings-command.repository.interface'
import type { UserSettingsViewDTO } from '../dtos/settings.dto'
import type { ISettingsMapper } from '../mappers/settings.mapper'

type UpdateCookieConsentRepository = {
  updateCookieConsent: ISettingsCommandRepository['updateCookieConsent']
}

export interface IUpdateCookieConsentUseCase {
  execute(userId: string, cookieConsent: boolean): Promise<UserSettingsViewDTO | null>
}

export class UpdateCookieConsentUseCase implements IUpdateCookieConsentUseCase {
  constructor(
    private readonly _settingsRepository: UpdateCookieConsentRepository,
    private readonly _settingsMapper: ISettingsMapper,
  ) {}

  async execute(
    userId: string,
    cookieConsent: boolean,
  ): Promise<UserSettingsViewDTO | null> {
    const settings = await this._settingsRepository.updateCookieConsent({
      userId,
      cookieConsent,
    })

    return this._settingsMapper.toNullableDto(settings)
  }
}