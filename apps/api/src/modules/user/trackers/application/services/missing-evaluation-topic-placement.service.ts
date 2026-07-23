import type {
  AddMissingEvaluationTopicResult,
  MissingTopicSuggestion,
  TrackerSubtopicRecord,
  TrackerTopicRecord,
} from '../../domain/trackers.types';
import type { IMissingEvaluationTopicPlacementRepository } from '../missing-evaluation-topic.ports';
import {
  findBestMatchingParent,
  parseNewTopLevelPlacement,
  type NewTopLevelPlacement,
} from '../missing-topic-placement.policy';
import { TrackerApplicationError } from '../tracker-application.error';

type PlacementInput = {
  trackerId: string;
  evaluationJobId: string;
  topicIndex: number;
  userId: string;
  missingTopic: MissingTopicSuggestion;
  trackerTopics: TrackerTopicRecord[];
  trackerSubtopics: TrackerSubtopicRecord[];
};

export interface IMissingEvaluationTopicPlacementService {
  place(input: PlacementInput): Promise<AddMissingEvaluationTopicResult>;
}

export class MissingEvaluationTopicPlacementService
  implements IMissingEvaluationTopicPlacementService
{
  constructor(private readonly _repository: IMissingEvaluationTopicPlacementRepository) {}

  async place(input: PlacementInput): Promise<AddMissingEvaluationTopicResult> {
    const placement = parseNewTopLevelPlacement(input.missingTopic.suggestedParentTitle);

    return placement.isNewTopLevel
      ? this.placeAtTopLevel(input, placement)
      : this.placeUnderParent(input);
  }

  private async placeAtTopLevel(
    input: PlacementInput,
    placement: NewTopLevelPlacement
  ): Promise<AddMissingEvaluationTopicResult> {
    const order = await this.resolveTopLevelOrder(input.trackerId, input.trackerTopics, placement);
    const addedTopic = await this._repository.createTrackerTopic({
      trackerId: input.trackerId,
      title: input.missingTopic.title,
      description: input.missingTopic.description,
      order,
    });

    await Promise.all([
      this._repository.incrementTrackerTopicsCount(input.trackerId),
      this._repository.markMissingEvaluationTopicAsAdded({
        evaluationJobId: input.evaluationJobId,
        topicIndex: input.topicIndex,
        addedTopicId: addedTopic._id.toString(),
      }),
    ]);

    return {
      trackerId: input.trackerId,
      evaluationJobId: input.evaluationJobId,
      missingTopicIndex: input.topicIndex,
      addedTopic: {
        _id: addedTopic._id.toString(),
        trackerId: addedTopic.trackerId.toString(),
        title: addedTopic.title,
        description: addedTopic.description,
        order: addedTopic.order,
      },
      placedUnder: { type: 'tracker', _id: input.trackerId, title: 'Top Level' },
    };
  }

  private async placeUnderParent(input: PlacementInput): Promise<AddMissingEvaluationTopicResult> {
    const suggestedParentTitle = input.missingTopic.suggestedParentTitle;
    const matchedSubtopic = findBestMatchingParent(input.trackerSubtopics, suggestedParentTitle);
    const matchedTopic = matchedSubtopic
      ? null
      : findBestMatchingParent(input.trackerTopics, suggestedParentTitle);

    if (!matchedSubtopic && !matchedTopic) {
      throw TrackerApplicationError.suggestedParentNotFound(
        `Suggested parent "${suggestedParentTitle}" was not found in this tracker`
      );
    }

    const topicId = matchedSubtopic
      ? matchedSubtopic.topicId.toString()
      : matchedTopic!._id.toString();
    const parentSubtopicId = matchedSubtopic ? matchedSubtopic._id.toString() : null;
    const lastSibling = await this._repository.findLastSiblingSubtopic({
      topicId,
      parentSubtopicId,
    });
    const addedSubtopic = await this._repository.createTrackerSubtopic({
      trackerId: input.trackerId,
      topicId,
      parentSubtopicId,
      title: input.missingTopic.title,
      description: input.missingTopic.description,
      order: (lastSibling?.order || 0) + 1,
      depth: matchedSubtopic ? matchedSubtopic.depth + 1 : 1,
    });

    await Promise.all([
      this._repository.incrementTrackerSubtopicsCount(input.trackerId),
      this._repository.recomputeTrackerProgress({
        trackerId: input.trackerId,
        userId: input.userId,
      }),
      this._repository.markMissingEvaluationTopicAsAdded({
        evaluationJobId: input.evaluationJobId,
        topicIndex: input.topicIndex,
        addedSubtopicId: addedSubtopic._id.toString(),
      }),
    ]);

    return {
      trackerId: input.trackerId,
      evaluationJobId: input.evaluationJobId,
      missingTopicIndex: input.topicIndex,
      addedSubtopic: {
        _id: addedSubtopic._id.toString(),
        trackerId: addedSubtopic.trackerId.toString(),
        topicId: addedSubtopic.topicId.toString(),
        parentSubtopicId: addedSubtopic.parentSubtopicId?.toString() ?? null,
        title: addedSubtopic.title,
        description: addedSubtopic.description,
        order: addedSubtopic.order,
        depth: addedSubtopic.depth,
      },
      placedUnder: matchedSubtopic
        ? { type: 'subtopic', _id: matchedSubtopic._id.toString(), title: matchedSubtopic.title }
        : { type: 'topic', _id: matchedTopic!._id.toString(), title: matchedTopic!.title },
    };
  }

  private async resolveTopLevelOrder(
    trackerId: string,
    trackerTopics: TrackerTopicRecord[],
    placement: NewTopLevelPlacement
  ): Promise<number> {
    if (placement.referenceTitle && placement.relation) {
      const referenceTopic = findBestMatchingParent(trackerTopics, placement.referenceTitle);
      if (referenceTopic) {
        const order = referenceTopic.order + (placement.relation === 'after' ? 1 : 0);
        await this._repository.shiftTopicOrdersFrom({ trackerId, fromOrder: order });
        return order;
      }
    }

    const lastTopic = await this._repository.findLastTopicForTracker(trackerId);
    return (lastTopic?.order || 0) + 1;
  }
}
