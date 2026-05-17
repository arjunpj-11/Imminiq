import type { SettingsRepository } from '../../domain/repositories/settings.repository.interface'
import type { UpdateEmailDigestPayload } from '../../domain/types/settings.types'

export class UpdateEmailDigestUseCase {
  constructor(
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(
    userId: string,
    payload: UpdateEmailDigestPayload
  ) {
    return this.settingsRepository.updateEmailDigest(userId, payload)
  }
}
