import type { IAdaptiveLearningRepository } from '../../domain/repositories/adaptive-learning.repository.interface';
import type { IAdaptiveLearningAgent } from '../../domain/services/adaptive-learning-agent.interface';
import type { IAdaptiveTestGenerator } from '../../domain/services/adaptive-test-generator.interface';
import { AdaptiveLearningApplicationError } from '../adaptive-learning-application.error';
import type { IAdaptiveAssessmentGenerationDTO } from '../adaptive-learning.dto';
import type { IAdaptiveLearningMapper } from '../adaptive-learning.mapper';

export interface IGenerateAdaptiveAssessmentUseCase {
  execute(userId: string): Promise<IAdaptiveAssessmentGenerationDTO>;
}

export class GenerateAdaptiveAssessmentUseCase implements IGenerateAdaptiveAssessmentUseCase {
  constructor(
    private readonly _repository: IAdaptiveLearningRepository,
    private readonly _agent: IAdaptiveLearningAgent,
    private readonly _testGenerator: IAdaptiveTestGenerator,
    private readonly _mapper: IAdaptiveLearningMapper
  ) {}

  async execute(userId: string): Promise<IAdaptiveAssessmentGenerationDTO> {
    const [snapshot, profile] = await Promise.all([
      this._repository.getLearnerSnapshot(userId),
      this._repository.getOrCreateProfile(userId),
    ]);

    if (snapshot.trackers.length === 0) {
      throw AdaptiveLearningApplicationError.trackerRequired();
    }

    const plan = await this._agent.planAssessment({ snapshot, profile });
    const job = await this._testGenerator.generate(userId, plan, profile.masteryScore);

    return this._mapper.toAssessmentGeneration(job);
  }
}
