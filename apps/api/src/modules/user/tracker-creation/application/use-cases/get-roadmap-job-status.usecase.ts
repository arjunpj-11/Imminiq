import type { ITrackerCreationAIJobQueryRepository } from '../../domain/repositories/tracker-creation-ai-job-query.repository.interface';
import type { GetJobStatusResultDTO } from '../tracker-creation.dto';
import { TrackerCreationApplicationError } from '../tracker-creation-application.error';
import type { ITrackerCreationMapper } from '../tracker-creation.mapper';
import type { ITrackerCreationJobOutputReader } from '../services/tracker-creation-job-output-reader.service';

export interface IGetRoadmapJobStatusUseCase {
  execute(jobId: string, userId: string): Promise<GetJobStatusResultDTO>;
}

export class GetRoadmapJobStatusUseCase implements IGetRoadmapJobStatusUseCase {
  constructor(
    private readonly _trackerCreationRepository: ITrackerCreationAIJobQueryRepository,
    private readonly _trackerCreationMapper: ITrackerCreationMapper,
    private readonly _trackerCreationJobOutputReader: ITrackerCreationJobOutputReader
  ) {}

  async execute(jobId: string, userId: string): Promise<GetJobStatusResultDTO> {
    const job = await this._trackerCreationRepository.getJobById(jobId);

    if (!job) {
      throw TrackerCreationApplicationError.notFound('Job not found');
    }

    if (!job.belongsTo(userId)) {
      throw TrackerCreationApplicationError.forbidden();
    }

    const steps = await this._trackerCreationRepository.getJobSteps(jobId);
    const trackerId = this._trackerCreationJobOutputReader.getTrackerId(job.outputData);
    const testId = this._trackerCreationJobOutputReader.getTestId(job.outputData);

    return this._trackerCreationMapper.toJobStatusDto(job, steps, trackerId, testId);
  }
}
