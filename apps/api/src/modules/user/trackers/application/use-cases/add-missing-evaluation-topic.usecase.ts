import type {
  AddMissingEvaluationTopicDTO,
} from '../tracker.dto';
import type {
  AddMissingEvaluationTopicInput,
  MissingTopicSuggestion,
} from '../../domain/trackers.types';
import type { ITrackerMapper } from '../tracker.mapper';
import type { IMissingEvaluationTopicReader } from '../missing-evaluation-topic.ports';
import type { IMissingEvaluationTopicPlacementService } from '../services/missing-evaluation-topic-placement.service';
import { TrackerApplicationError } from '../tracker-application.error';

export interface IAddMissingEvaluationTopicUseCase {
  execute(input: AddMissingEvaluationTopicInput): Promise<AddMissingEvaluationTopicDTO>;
}

export class AddMissingEvaluationTopicUseCase implements IAddMissingEvaluationTopicUseCase {
  constructor(
    private readonly _reader: IMissingEvaluationTopicReader,
    private readonly _placement: IMissingEvaluationTopicPlacementService,
    private readonly _mapper: ITrackerMapper
  ) {}

  async execute({
    trackerId,
    evaluationJobId,
    topicIndex,
    userId,
  }: AddMissingEvaluationTopicInput): Promise<AddMissingEvaluationTopicDTO> {
    const parsedTopicIndex = this.parseTopicIndex(topicIndex);
    const [tracker, evaluationJob] = await Promise.all([
      this._reader.findOwnedTrackerById({ trackerId, userId }),
      this._reader.findEvaluationJobById({ evaluationJobId, userId }),
    ]);

    if (!tracker) throw TrackerApplicationError.trackerNotFound('Tracker not found');
    if (!evaluationJob) {
      throw TrackerApplicationError.evaluationJobNotFound('Evaluation job not found');
    }
    if (evaluationJob.status !== 'completed') {
      throw TrackerApplicationError.evaluationJobPending('Evaluation job is not completed yet');
    }
    if (evaluationJob.outputData?.trackerId !== trackerId) {
      throw TrackerApplicationError.trackerEvaluationMismatch(
        'Evaluation result does not belong to this tracker'
      );
    }

    const missingTopic = this.getMissingTopic(
      evaluationJob.outputData?.evaluation?.missingTopics,
      parsedTopicIndex
    );
    const [trackerTopics, trackerSubtopics] = await Promise.all([
      this._reader.getTopicsForTracker(trackerId),
      this._reader.getSubtopicsForTracker(trackerId),
    ]);
    const result = await this._placement.place({
      trackerId,
      evaluationJobId,
      topicIndex: parsedTopicIndex,
      userId,
      missingTopic,
      trackerTopics,
      trackerSubtopics,
    });

    return this._mapper.toAddMissingEvaluationTopicDto(result);
  }

  private parseTopicIndex(topicIndex: string | number): number {
    const parsed = Number(topicIndex);
    if (!Number.isInteger(parsed) || parsed < 0) {
      throw TrackerApplicationError.invalidTopicIndex('Invalid missing topic index');
    }
    return parsed;
  }

  private getMissingTopic(value: unknown, topicIndex: number): MissingTopicSuggestion {
    if (!Array.isArray(value)) {
      throw TrackerApplicationError.missingTopicsNotFound('Missing topic suggestions not found');
    }

    const missingTopic = value[topicIndex] as MissingTopicSuggestion | undefined;
    if (!missingTopic) {
      throw TrackerApplicationError.missingTopicNotFound('Missing topic suggestion not found');
    }
    if (missingTopic.isAdded || missingTopic.addedSubtopicId || missingTopic.addedTopicId) {
      throw TrackerApplicationError.missingTopicAlreadyAdded(
        'This missing topic has already been added'
      );
    }
    return missingTopic;
  }
}
