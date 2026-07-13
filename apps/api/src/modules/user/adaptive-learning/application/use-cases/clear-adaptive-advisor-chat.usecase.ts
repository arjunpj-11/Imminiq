import type { IAdaptiveLearningRepository } from '../../domain/repositories/adaptive-learning.repository.interface'

export interface IClearAdaptiveAdvisorChatUseCase {
  execute(userId: string): Promise<void>
}

export class ClearAdaptiveAdvisorChatUseCase
  implements IClearAdaptiveAdvisorChatUseCase
{
  constructor(private readonly _repository: IAdaptiveLearningRepository) {}

  execute(userId: string): Promise<void> {
    return this._repository.clearAdvisorMessages(userId)
  }
}
