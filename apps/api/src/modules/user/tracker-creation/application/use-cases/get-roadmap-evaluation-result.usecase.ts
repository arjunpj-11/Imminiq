import type { ITrackerCreationAIJobQueryRepository } from '../../domain/repositories/tracker-creation-ai-job-query.repository.interface';
import type { GetEvaluationResultDTO } from '../tracker-creation.dto';
import { TrackerCreationApplicationError } from '../tracker-creation-application.error';
import type { ITrackerCreationJobOutputReader } from '../services/tracker-creation-job-output-reader.service';

export interface IGetRoadmapEvaluationResultUseCase {
  execute(jobId: string, userId: string): Promise<GetEvaluationResultDTO>;
}

export class GetRoadmapEvaluationResultUseCase implements IGetRoadmapEvaluationResultUseCase {
  constructor(
    private readonly _trackerCreationRepository: ITrackerCreationAIJobQueryRepository,
    private readonly _trackerCreationJobOutputReader: ITrackerCreationJobOutputReader
  ) {}

  async execute(jobId: string, userId: string): Promise<GetEvaluationResultDTO> {
    const job = await this._trackerCreationRepository.getJobById(jobId);

    if (!job) {
      throw TrackerCreationApplicationError.notFound('Evaluation job not found');
    }

    if (!job.belongsTo(userId)) {
      throw TrackerCreationApplicationError.forbidden();
    }

    if (!job.isEvaluationJob()) {
      throw TrackerCreationApplicationError.invalidJobType(
        'This job is not a roadmap evaluation job'
      );
    }

    if (!job.isCompleted()) {
      throw TrackerCreationApplicationError.jobPending('Evaluation is not completed yet');
    }

    const evaluation = this._trackerCreationJobOutputReader.getEvaluation(job.outputData);

    if (!evaluation) {
      throw TrackerCreationApplicationError.evaluationResultMissing();
    }

    return {
      jobId: job.id,
      trackerId: this._trackerCreationJobOutputReader.getTrackerId(job.outputData),
      evaluation,
    };
  }
}
