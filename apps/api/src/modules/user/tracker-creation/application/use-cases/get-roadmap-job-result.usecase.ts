import type { ITrackerCreationAIJobQueryRepository } from '../../domain/repositories/tracker-creation-ai-job-query.repository.interface';
import type { ITrackerCreationRoadmapRepository } from '../../domain/repositories/tracker-creation-roadmap.repository.interface';
import type { RoadmapTreeResultDTO } from '../tracker-creation.dto';
import { TrackerCreationApplicationError } from '../tracker-creation-application.error';
import type { ITrackerCreationMapper } from '../tracker-creation.mapper';
import type { ITrackerCreationJobOutputReader } from '../services/tracker-creation-job-output-reader.service';

type RoadmapJobResultRepository = ITrackerCreationAIJobQueryRepository &
  ITrackerCreationRoadmapRepository;

export interface IGetRoadmapJobResultUseCase {
  execute(jobId: string, userId: string): Promise<RoadmapTreeResultDTO>;
}

export class GetRoadmapJobResultUseCase implements IGetRoadmapJobResultUseCase {
  constructor(
    private readonly _trackerCreationRepository: RoadmapJobResultRepository,
    private readonly _trackerCreationMapper: ITrackerCreationMapper,
    private readonly _trackerCreationJobOutputReader: ITrackerCreationJobOutputReader
  ) {}

  async execute(jobId: string, userId: string): Promise<RoadmapTreeResultDTO> {
    const job = await this._trackerCreationRepository.getJobById(jobId);

    if (!job) {
      throw TrackerCreationApplicationError.notFound('Job not found');
    }

    if (!job.belongsTo(userId)) {
      throw TrackerCreationApplicationError.forbidden();
    }

    if (!job.isRoadmapJob()) {
      throw TrackerCreationApplicationError.invalidJobType(
        'This job is not a roadmap generation job'
      );
    }

    if (!job.isCompleted()) {
      throw TrackerCreationApplicationError.jobPending('Job not completed yet');
    }

    const trackerId = this._trackerCreationJobOutputReader.getTrackerId(job.outputData);

    if (!trackerId) {
      throw TrackerCreationApplicationError.serverError('Tracker not created');
    }

    const result = await this._trackerCreationRepository.getRoadmapTree(trackerId);

    if (!result.tracker) {
      throw TrackerCreationApplicationError.trackerNotFound('Generated tracker not found');
    }

    return this._trackerCreationMapper.toRoadmapTreeDto(result);
  }
}
