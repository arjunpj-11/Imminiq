import type {
  CreateTrackerSubtopicInput,
  CreateTrackerTopicInput,
  CreatedTrackerSubtopicRecord,
  CreatedTrackerTopicRecord,
  EvaluationJobRecord,
  LastSiblingSubtopicRecord,
  LastTopicRecord,
  TrackerRecord,
  TrackerSubtopicRecord,
  TrackerTopicRecord,
} from '../domain/trackers.types';
import type {
  FindEvaluationJobByIdInput,
  FindLastSiblingSubtopicInput,
  MarkMissingEvaluationTopicAsAddedInput,
  ShiftTopicOrdersFromInput,
} from '../domain/repositories/tracker-content.repository.interface';
import type { FindOwnedTrackerByIdInput } from '../domain/repositories/tracker-query.repository.interface';
import type {
  RecomputeTrackerProgressInput,
  TrackerProgressUpdateResult,
} from '../domain/repositories/tracker-progress.repository.interface';

export interface IMissingEvaluationTopicReader {
  findOwnedTrackerById(data: FindOwnedTrackerByIdInput): Promise<TrackerRecord | null>;
  findEvaluationJobById(data: FindEvaluationJobByIdInput): Promise<EvaluationJobRecord | null>;
  getTopicsForTracker(trackerId: string): Promise<TrackerTopicRecord[]>;
  getSubtopicsForTracker(trackerId: string): Promise<TrackerSubtopicRecord[]>;
}

export interface IMissingEvaluationTopicPlacementRepository {
  findLastTopicForTracker(trackerId: string): Promise<LastTopicRecord | null>;
  shiftTopicOrdersFrom(data: ShiftTopicOrdersFromInput): Promise<void>;
  createTrackerTopic(data: CreateTrackerTopicInput): Promise<CreatedTrackerTopicRecord>;
  findLastSiblingSubtopic(
    data: FindLastSiblingSubtopicInput
  ): Promise<LastSiblingSubtopicRecord | null>;
  createTrackerSubtopic(data: CreateTrackerSubtopicInput): Promise<CreatedTrackerSubtopicRecord>;
  incrementTrackerTopicsCount(trackerId: string): Promise<void>;
  incrementTrackerSubtopicsCount(trackerId: string): Promise<void>;
  markMissingEvaluationTopicAsAdded(data: MarkMissingEvaluationTopicAsAddedInput): Promise<void>;
  recomputeTrackerProgress(
    data: RecomputeTrackerProgressInput
  ): Promise<TrackerProgressUpdateResult>;
}
