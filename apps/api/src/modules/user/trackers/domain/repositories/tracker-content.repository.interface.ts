import type {
  CreateTrackerSubtopicInput,
  CreateTrackerTopicInput,
  CreatedTrackerSubtopicRecord,
  CreatedTrackerTopicRecord,
  EvaluationJobRecord,
  LastSiblingSubtopicRecord,
  LastTopicRecord,
} from '../trackers.types';

export type FindEvaluationJobByIdInput = {
  evaluationJobId: string;
  userId: string;
};

export type ShiftTopicOrdersFromInput = {
  trackerId: string;
  fromOrder: number;
};

export type FindLastSiblingSubtopicInput = {
  topicId: string;
  parentSubtopicId: string | null;
};

export type MarkMissingEvaluationTopicAsAddedInput = {
  evaluationJobId: string;
  topicIndex: number;
  addedSubtopicId?: string;
  addedTopicId?: string;
};

export interface ITrackerContentRepository {
  findEvaluationJobById(data: FindEvaluationJobByIdInput): Promise<EvaluationJobRecord | null>;

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

  /**
   * Create a tracker and its nested topics/subtopics transactionally.
   * Implementations should use a DB transaction/session to ensure atomicity.
   */
  createTrackerWithNestedContent(input: {
    userId: string;
    title: string;
    slug: string;
    description?: string;
    domain?: string;
    goal?: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    isAIGenerated?: boolean;
    aiJobId?: string;
    topics: Array<{
      order: number;
      title: string;
      description?: string;
      learningVideo?: unknown | null;
      children?: any[];
    }>;
  }): Promise<{ trackerId: string }>;
}
