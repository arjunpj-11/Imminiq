import type { SettingsRepository } from '../../domain/repositories/settings.repository.interface'
import type { UpdateAIBehaviourPayload } from '../../domain/types/settings.types'

export class UpdateAIBehaviourUseCase {
  constructor(
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(
    userId: string,
    payload: UpdateAIBehaviourPayload
  ) {
    return this.settingsRepository.updateAIBehaviour(userId, payload)
  }
}
