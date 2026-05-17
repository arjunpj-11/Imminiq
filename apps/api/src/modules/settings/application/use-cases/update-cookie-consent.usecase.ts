import type { SettingsRepository } from '../../domain/repositories/settings.repository.interface'

export class UpdateCookieConsentUseCase {
  constructor(
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(
    userId: string,
    cookieConsent: boolean
  ) {
    return this.settingsRepository.updateCookieConsent(userId, cookieConsent)
  }
}
