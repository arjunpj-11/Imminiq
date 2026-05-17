import type { SettingsRepository } from '../../domain/repositories/settings.repository.interface'
import type { UpdateCompilerPayload } from '../../domain/types/settings.types'

export class UpdateCompilerUseCase {
  constructor(
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(
    userId: string,
    payload: UpdateCompilerPayload
  ) {
    return this.settingsRepository.updateCompiler(userId, payload)
  }
}
