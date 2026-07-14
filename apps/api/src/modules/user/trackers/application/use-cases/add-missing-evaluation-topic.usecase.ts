// apps/api/src/modules/user/trackers/application/use-cases/add-missing-evaluation-topic.usecase.ts

import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import {
  findBestMatchingParent,
  parseNewTopLevelPlacement,
  type NewTopLevelPlacement,
} from '../missing-topic-placement.policy';

import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type {
  AddMissingEvaluationTopicInput,
  AddMissingEvaluationTopicResult,
  TrackerTopicRecord,
} from '../../domain/trackers.types';

type AddMissingEvaluationTopicDTO = ReturnType<ITrackerMapper['toAddMissingEvaluationTopicDto']>;

type AddMissingEvaluationTopicRepository = Pick<
  ITrackerRepository,
  | 'createTrackerSubtopic'
  | 'createTrackerTopic'
  | 'findEvaluationJobById'
  | 'findLastSiblingSubtopic'
  | 'findLastTopicForTracker'
  | 'findOwnedTrackerById'
  | 'getSubtopicsForTracker'
  | 'getTopicsForTracker'
  | 'incrementTrackerSubtopicsCount'
  | 'incrementTrackerTopicsCount'
  | 'markMissingEvaluationTopicAsAdded'
  | 'recomputeTrackerProgress'
  | 'shiftTopicOrdersFrom'
>;

const resolveTopLevelTopicOrder = async (
  trackerRepository: AddMissingEvaluationTopicRepository,
  trackerId: string,
  trackerTopics: TrackerTopicRecord[],
  placement: NewTopLevelPlacement
): Promise<number> => {
  if (placement.referenceTitle && placement.relation) {
    const referenceTopic = findBestMatchingParent(trackerTopics, placement.referenceTitle);

    if (referenceTopic) {
      const referenceOrder = referenceTopic.order;

      const newOrder = placement.relation === 'before' ? referenceOrder : referenceOrder + 1;

      await trackerRepository.shiftTopicOrdersFrom({
        trackerId,
        fromOrder: newOrder,
      });

      return newOrder;
    }
  }

  const lastTopic = await trackerRepository.findLastTopicForTracker(trackerId);

  return (lastTopic?.order || 0) + 1;
};

export interface IAddMissingEvaluationTopicUseCase {
  execute({
    trackerId,
    evaluationJobId,
    topicIndex,
    userId,
  }: AddMissingEvaluationTopicInput): Promise<AddMissingEvaluationTopicDTO>;
}

export class AddMissingEvaluationTopicUseCase implements IAddMissingEvaluationTopicUseCase {
  constructor(
    private readonly _trackerRepository: AddMissingEvaluationTopicRepository,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute({
    trackerId,
    evaluationJobId,
    topicIndex,
    userId,
  }: AddMissingEvaluationTopicInput): Promise<AddMissingEvaluationTopicDTO> {
    const parsedTopicIndex = Number(topicIndex);

    if (!Number.isInteger(parsedTopicIndex) || parsedTopicIndex < 0) {
      throw TrackerApplicationError.invalidTopicIndex('Invalid missing topic index');
    }

    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId,
      userId,
    });

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    const evaluationJob = await this._trackerRepository.findEvaluationJobById({
      evaluationJobId,
      userId,
    });

    if (!evaluationJob) {
      throw TrackerApplicationError.evaluationJobNotFound('Evaluation job not found');
    }

    if (evaluationJob.status !== 'completed') {
      throw TrackerApplicationError.evaluationJobPending('Evaluation job is not completed yet');
    }

    const outputData = evaluationJob.outputData;

    if (outputData?.trackerId !== trackerId) {
      throw TrackerApplicationError.trackerEvaluationMismatch(
        'Evaluation result does not belong to this tracker'
      );
    }

    const missingTopics = outputData?.evaluation?.missingTopics;

    if (!Array.isArray(missingTopics)) {
      throw TrackerApplicationError.missingTopicsNotFound('Missing topic suggestions not found');
    }

    const missingTopic = missingTopics[parsedTopicIndex];

    if (!missingTopic) {
      throw TrackerApplicationError.missingTopicNotFound('Missing topic suggestion not found');
    }

    if (missingTopic.isAdded || missingTopic.addedSubtopicId || missingTopic.addedTopicId) {
      throw TrackerApplicationError.missingTopicAlreadyAdded(
        'This missing topic has already been added'
      );
    }

    const [trackerTopics, trackerSubtopics] = await Promise.all([
      this._trackerRepository.getTopicsForTracker(trackerId),
      this._trackerRepository.getSubtopicsForTracker(trackerId),
    ]);

    const suggestedParentTitle = missingTopic.suggestedParentTitle;
    const newTopLevelPlacement = parseNewTopLevelPlacement(suggestedParentTitle);

    if (newTopLevelPlacement.isNewTopLevel) {
      const newTopicOrder = await resolveTopLevelTopicOrder(
        this._trackerRepository,
        trackerId,
        trackerTopics,
        newTopLevelPlacement
      );

      const addedTopic = await this._trackerRepository.createTrackerTopic({
        trackerId,
        title: missingTopic.title,
        description: missingTopic.description,
        order: newTopicOrder,
      });

      await Promise.all([
        this._trackerRepository.incrementTrackerTopicsCount(trackerId),
        this._trackerRepository.markMissingEvaluationTopicAsAdded({
          evaluationJobId,
          topicIndex: parsedTopicIndex,
          addedTopicId: addedTopic._id.toString(),
        }),
      ]);

      const result: AddMissingEvaluationTopicResult = {
        trackerId,
        evaluationJobId,
        missingTopicIndex: parsedTopicIndex,
        addedTopic: {
          _id: addedTopic._id.toString(),
          trackerId: addedTopic.trackerId.toString(),
          title: addedTopic.title,
          description: addedTopic.description,
          order: addedTopic.order,
        },
        placedUnder: {
          type: 'tracker',
          _id: trackerId,
          title: 'Top Level',
        },
      };

      return this._trackerMapper.toAddMissingEvaluationTopicDto(result);
    }

    const matchedSubtopicParent = findBestMatchingParent(trackerSubtopics, suggestedParentTitle);

    const matchedTopicParent = matchedSubtopicParent
      ? null
      : findBestMatchingParent(trackerTopics, suggestedParentTitle);

    if (!matchedSubtopicParent && !matchedTopicParent) {
      throw TrackerApplicationError.suggestedParentNotFound(
        `Suggested parent "${suggestedParentTitle}" was not found in this tracker`
      );
    }

    const topicId = matchedSubtopicParent
      ? matchedSubtopicParent.topicId.toString()
      : matchedTopicParent!._id.toString();

    const parentSubtopicId = matchedSubtopicParent ? matchedSubtopicParent._id.toString() : null;

    const depth = matchedSubtopicParent ? matchedSubtopicParent.depth + 1 : 1;

    const lastSibling = await this._trackerRepository.findLastSiblingSubtopic({
      topicId,
      parentSubtopicId,
    });

    const addedSubtopic = await this._trackerRepository.createTrackerSubtopic({
      trackerId,
      topicId,
      parentSubtopicId,
      title: missingTopic.title,
      description: missingTopic.description,
      order: (lastSibling?.order || 0) + 1,
      depth,
    });

    await Promise.all([
      this._trackerRepository.incrementTrackerSubtopicsCount(trackerId),
      this._trackerRepository.recomputeTrackerProgress({
        trackerId,
        userId,
      }),
      this._trackerRepository.markMissingEvaluationTopicAsAdded({
        evaluationJobId,
        topicIndex: parsedTopicIndex,
        addedSubtopicId: addedSubtopic._id.toString(),
      }),
    ]);

    const result: AddMissingEvaluationTopicResult = {
      trackerId,
      evaluationJobId,
      missingTopicIndex: parsedTopicIndex,
      addedSubtopic: {
        _id: addedSubtopic._id.toString(),
        trackerId: addedSubtopic.trackerId.toString(),
        topicId: addedSubtopic.topicId.toString(),
        parentSubtopicId: addedSubtopic.parentSubtopicId
          ? addedSubtopic.parentSubtopicId.toString()
          : null,
        title: addedSubtopic.title,
        description: addedSubtopic.description,
        order: addedSubtopic.order,
        depth: addedSubtopic.depth,
      },
      placedUnder: matchedSubtopicParent
        ? {
            type: 'subtopic',
            _id: matchedSubtopicParent._id.toString(),
            title: matchedSubtopicParent.title,
          }
        : {
            type: 'topic',
            _id: matchedTopicParent!._id.toString(),
            title: matchedTopicParent!.title,
          },
    };

    return this._trackerMapper.toAddMissingEvaluationTopicDto(result);
  }
}
