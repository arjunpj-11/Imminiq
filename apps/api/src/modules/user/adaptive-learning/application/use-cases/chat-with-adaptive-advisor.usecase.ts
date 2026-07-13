import type { IAdaptiveLearningRepository } from '../../domain/repositories/adaptive-learning.repository.interface';
import type { IAdaptiveLearningAgent } from '../../domain/services/adaptive-learning-agent.interface';
import { AdaptiveLearningApplicationError } from '../adaptive-learning-application.error';
import type { IAdaptiveAdvisorChatDTO } from '../adaptive-learning.dto';
import type { IAdaptiveLearningMapper } from '../adaptive-learning.mapper';

export interface IChatWithAdaptiveAdvisorUseCase {
  execute(userId: string, question: string): Promise<IAdaptiveAdvisorChatDTO>;
}

export class ChatWithAdaptiveAdvisorUseCase implements IChatWithAdaptiveAdvisorUseCase {
  constructor(
    private readonly _repository: IAdaptiveLearningRepository,
    private readonly _agent: IAdaptiveLearningAgent,
    private readonly _mapper: IAdaptiveLearningMapper
  ) {}

  async execute(userId: string, question: string): Promise<IAdaptiveAdvisorChatDTO> {
    const cleanQuestion = question.trim();
    if (cleanQuestion.length < 2) {
      throw AdaptiveLearningApplicationError.invalidAdvisorQuestion();
    }

    const [snapshot, profile, history] = await Promise.all([
      this._repository.getLearnerSnapshot(userId),
      this._repository.getOrCreateProfile(userId),
      this._repository.listAdvisorMessages(userId, 12),
    ]);

    await this._repository.addAdvisorMessage({
      userId,
      role: 'user',
      content: cleanQuestion,
    });

    const answer = await this._agent.answer({
      question: cleanQuestion,
      snapshot,
      profile,
      history,
    });
    const message = await this._repository.addAdvisorMessage({
      userId,
      role: 'assistant',
      content: answer.content,
    });

    return this._mapper.toAdvisorChat({
      message,
      ...(answer.action ? { action: answer.action } : {}),
    });
  }
}
