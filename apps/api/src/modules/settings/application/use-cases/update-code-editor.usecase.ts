import type { SettingsRepository } from '../../domain/repositories/settings.repository.interface'
import type { UpdateCodeEditorPayload } from '../../domain/types/settings.types'

export class UpdateCodeEditorUseCase {
  constructor(
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(
    userId: string,
    payload: UpdateCodeEditorPayload
  ) {
    return this.settingsRepository.updateCodeEditor(userId, payload)
  }
}
