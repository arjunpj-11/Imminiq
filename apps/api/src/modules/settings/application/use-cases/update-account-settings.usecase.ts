import type { SettingsRepository } from '../../domain/repositories/settings.repository.interface'
import type { UpdateAccountPayload } from '../../domain/types/settings.types'

export class UpdateAccountSettingsUseCase {
  constructor(
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(
    userId: string,
    payload: UpdateAccountPayload
  ) {
    return this.settingsRepository.updateAccountSettings(userId, payload)
  }
}
