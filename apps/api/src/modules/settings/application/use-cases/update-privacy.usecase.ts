import type { SettingsRepository } from '../../domain/repositories/settings.repository.interface'
import type { UpdatePrivacyPayload } from '../../domain/types/settings.types'

export class UpdatePrivacyUseCase {
  constructor(
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(
    userId: string,
    payload: UpdatePrivacyPayload
  ) {
    return this.settingsRepository.updatePrivacy(userId, payload)
  }
}
