import type { SettingsRepository } from '../../domain/repositories/settings.repository.interface'

export class AcceptTermsUseCase {
  constructor(
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(userId: string) {
    return this.settingsRepository.acceptTerms(userId)
  }
}
