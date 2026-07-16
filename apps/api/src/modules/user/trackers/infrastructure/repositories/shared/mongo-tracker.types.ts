import { Types } from 'mongoose';

import type {
  GeneratedTrackerLessonRecord,
  LearningVideoRecord,
  TrackerListFilter,
} from '../../../domain/trackers.types';

export type MongoPrimitive = string | number | boolean | null | Date | Types.ObjectId;

export type MongoOperatorValue = {
  $ne?: MongoPrimitive;
  $gt?: string | number | Date;
  $gte?: string | number | Date;
  $lte?: string | number | Date;
  $in?: Array<string | number | null | Types.ObjectId>;
};

export type MongoValue = MongoPrimitive | MongoPrimitive[] | MongoOperatorValue;

export type MongoQuery = Record<string, MongoValue>;

export type MongoUpdateValue = MongoPrimitive | MongoPrimitive[] | Record<string, unknown>;

export type MongoUpdate = Record<string, MongoUpdateValue>;

export type MongoSortOrder = 1 | -1;

export type StreakIntensityLevel = 'none' | 'low' | 'medium' | 'high';

export type MongoDuplicateKeyError = {
  code?: number;
};

export type MongoTrackerSortBy = TrackerListFilter['sortBy'];

export type MongoSubtopicContentRecord = {
  _id: Types.ObjectId;
  trackerId: Types.ObjectId;
  topicId: Types.ObjectId;
  parentSubtopicId?: Types.ObjectId | null;
  title: string;
  description: string;
  order: number;
  depth: number;
  isLocked?: boolean;
  estimatedMinutes?: number;
  learningVideo?: LearningVideoRecord | null;
};

export type MongoSubtopicProgressRecord = {
  subtopicId?: Types.ObjectId;
  status?: string;
  isUnlocked?: boolean;
  progressPercent?: number;
  completedAt?: Date | null;
};

export type MongoTopicContentRecord = {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  [key: string]: unknown;
};

export type MongoTopicProgressRecord = {
  topicId?: Types.ObjectId;
  status?: string;
  progressPercent?: number;
};

export type MongoLessonVisualizationRecord = {
  html?: unknown;
  visualTitle?: unknown;
  visualDescription?: unknown;
};

export type MongoGeneratedLessonRecord = {
  generatedLesson?: GeneratedTrackerLessonRecord | null;
};
