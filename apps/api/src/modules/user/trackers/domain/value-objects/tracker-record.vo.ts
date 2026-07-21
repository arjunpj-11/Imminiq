export type { CompilerRuntime } from './compiler-runtime.vo';
export type { LessonType } from './lesson-type.vo';
export type { SubtopicStatus } from './subtopic-status.vo';
export type { TopicStatus } from './topic-status.vo';
export type { TrackerDomain } from './tracker-domain.vo';
export type { TrackerLevel } from './tracker-level.vo';
export type { TrackerSortBy } from './tracker-sort.vo';
export type { TrackerStatus } from './tracker-status.vo';
export type { TrackerVisibility } from './tracker-visibility.vo';

import type { LessonType } from './lesson-type.vo';
import type { SubtopicStatus } from './subtopic-status.vo';
import type { TopicStatus } from './topic-status.vo';
import type { TrackerDomain } from './tracker-domain.vo';
import type { TrackerLevel } from './tracker-level.vo';
import type { TrackerSortBy } from './tracker-sort.vo';
import type { TrackerStatus } from './tracker-status.vo';
import type { TrackerVisibility } from './tracker-visibility.vo';

/**
 * Persistence-neutral identifier used at the domain boundary.
 * Infrastructure adapters must convert database-native identifiers to strings.
 */
export type ObjectIdLike = string;

export type TrackerListFilter = {
  userId: string;
  status?: TrackerStatus | 'all';
  domain?: TrackerDomain | 'all';
  sortBy?: TrackerSortBy;
  page: number;
  limit: number;
};

export type CreateTrackerInput = {
  userId: string;
  title: string;
  description?: string;
  domain?: TrackerDomain;
  goal?: string;
  level?: TrackerLevel;
  visibility?: TrackerVisibility;
  moderationStatus?: 'active' | 'suspended' | 'deleted';
  moderationReason?: string | null;
};

export type PublishTrackerInput = {
  trackerId: string;
  userId: string;
  name?: string;
  description?: string;
  domain?: string;
  difficulty?: TrackerLevel;
  tags?: string[];
  allowClone?: boolean;
};

export type UpdateTrackerInput = {
  trackerId: string;
  userId: string;
  title?: string;
  description?: string;
  domain?: TrackerDomain;
  goal?: string;
  level?: TrackerLevel;
};

export type CreateTrackerTopicInput = {
  trackerId: string;
  title: string;
  description: string;
  order: number;
};

export type CreateTopicUseCaseInput = {
  trackerId: string;
  userId: string;
  title: string;
  description?: string;
};

export type CreateTrackerSubtopicInput = {
  trackerId: string;
  topicId: string;
  parentSubtopicId: string | null;
  title: string;
  description: string;
  order: number;
  depth: number;
};

export type CreateSubtopicUseCaseInput = {
  trackerId: string;
  topicId: string;
  userId: string;
  title: string;
  description?: string;
  parentSubtopicId?: string | null;
};

export type SubtopicProgressStatus = 'available' | 'in_progress' | 'completed';

export type UpdateSubtopicProgressInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  status: SubtopicProgressStatus;
};

export type AddMissingEvaluationTopicInput = {
  trackerId: string;
  evaluationJobId: string;
  topicIndex: string;
  userId: string;
};

export type MissingTopicSuggestion = {
  title: string;
  description: string;
  reason: string;
  suggestedParentTitle: string;
  isAdded?: boolean;
  addedSubtopicId?: string;
  addedTopicId?: string;
  addedAt?: Date | string;
};

export type EvaluationOutputData = {
  trackerId?: string;
  sourceRoadmapJobId?: string;
  evaluation?: {
    score?: number;
    grade?: string;
    summary?: string;
    missingTopics?: MissingTopicSuggestion[];
  };
};

// ─── Tracker ──────────────────────────────────────────────────────────────────

export type TrackerRecord = {
  _id: ObjectIdLike;
  ownerId?: ObjectIdLike | string;
  sourceTrackerId?: ObjectIdLike | null;
  cloneFreshnessAnalysisStatus?: 'pending' | 'completed' | 'failed' | null;
  cloneFreshnessAnalysisAvailable?: boolean;
  clonedFrom?: {
    trackerId: ObjectIdLike;
    ownerId: ObjectIdLike;
    name: string;
    username: string;
    avatarUrl?: string | null;
  } | null;
  title?: string;
  description?: string;
  domain?: TrackerDomain | string;
  goal?: string;
  contentLanguage?: string;
  level?: TrackerLevel | string;
  tags?: string[];
  allowClone?: boolean;
  status?: TrackerStatus;
  visibility?: TrackerVisibility;
  progressPercent?: number;
  topicsCount?: number;
  subtopicsCount?: number;
  completedSubtopicsCount?: number;
  publishedAt?: Date | null;
  completedAt?: Date | null;
  lastActiveAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type EvaluationJobRecord = {
  _id: ObjectIdLike;
  status: string;
  outputData?: EvaluationOutputData;
};

// ─── Topic ────────────────────────────────────────────────────────────────────

export type TrackerTopicRecord = {
  _id: ObjectIdLike;
  trackerId?: ObjectIdLike;
  sourceTopicId?: ObjectIdLike | null;
  isCloneAddition?: boolean;
  title: string;
  description?: string;
  order: number;
  learningVideo?: LearningVideoRecord | null;
};

export type LearningVideoRecord = {
  videoId: string;
  title: string;
  url: string;
  channelTitle: string;
  thumbnailUrl: string;
  durationSeconds: number;
};

export type TopicWithProgressRecord = TrackerTopicRecord & {
  status: TopicStatus;
  progressPercent: number;
};

// ─── Subtopic ─────────────────────────────────────────────────────────────────

// Content only — no progress fields
export type TrackerSubtopicRecord = {
  _id: ObjectIdLike;
  trackerId: ObjectIdLike;
  topicId: ObjectIdLike;
  parentSubtopicId?: ObjectIdLike | null;
  title: string;
  description: string;
  order: number;
  depth: number;
  isLocked: boolean; // renamed from defaultLocked
  learningVideo?: LearningVideoRecord | null;
};

// Content merged with user progress — used in use cases and API responses
export type SubtopicWithProgressRecord = TrackerSubtopicRecord & {
  status: SubtopicStatus;
  isUnlocked: boolean;
  isLocked: boolean;
  progressPercent: number;
  completedAt?: Date | null;
};

export type CreatedTrackerTopicRecord = {
  _id: ObjectIdLike;
  trackerId: ObjectIdLike;
  title: string;
  description: string;
  order: number;
};

export type CreatedTrackerSubtopicRecord = TrackerSubtopicRecord;

export type LastTopicRecord = { order?: number };
export type LastSiblingSubtopicRecord = { order?: number };

// ─── User Progress ────────────────────────────────────────────────────────────

export type UserSubtopicProgressRecord = {
  _id: ObjectIdLike;
  userId: ObjectIdLike;
  trackerId: ObjectIdLike;
  topicId: ObjectIdLike;
  subtopicId: ObjectIdLike;
  status: SubtopicStatus;
  isUnlocked: boolean;
  progressPercent: number;
  completedAt?: Date | null;
};

export type UserTopicProgressRecord = {
  _id: ObjectIdLike;
  userId: ObjectIdLike;
  trackerId: ObjectIdLike;
  topicId: ObjectIdLike;
  status: TopicStatus;
  progressPercent: number;
  completedAt?: Date | null;
};

export type TrackerProgressRecord = {
  _id: ObjectIdLike;
  userId: ObjectIdLike;
  trackerId: ObjectIdLike;
  totalTopics: number;
  completedTopics: number;
  totalSubtopics: number;
  completedSubtopics: number;
  completionPercentage: number;

  lastStudiedAt: Date | null;
  startedAt: Date;
  completedAt?: Date | null;
};

// ─── Summary & List ───────────────────────────────────────────────────────────

export type TrackerSummaryRecord = {
  totalTrackers: number;
  activeTrackers: number;
  completedTrackers: number;
  publishedTrackers: number;
  averageProgress: number;
};

export type TrackerListResult = {
  trackers: TrackerRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ─── Roadmap ──────────────────────────────────────────────────────────────────

export type RoadmapSubtopicNode = {
  _id: string;
  title: string;
  description: string;
  order: number;
  depth: number;
  status: SubtopicStatus;
  isLocked: boolean;
  learningVideo: LearningVideoRecord | null;
  progressPercent: number;
  completedAt: Date | null;
  children: RoadmapSubtopicNode[];
};

export type RoadmapTopicNode = {
  _id: string;
  sourceTopicId: string | null;
  isCloneAddition: boolean;
  title: string;
  description: string;
  order: number;
  status: TopicStatus;
  progressPercent: number;
  learningVideo: LearningVideoRecord | null;
  subtopics: RoadmapSubtopicNode[];
};

export type FlattenedLessonNode = RoadmapSubtopicNode & {
  topicId: string;
  topicTitle: string;
};

export type AddMissingEvaluationTopicResult = {
  trackerId: string;
  evaluationJobId: string;
  missingTopicIndex: number;
  addedSubtopic?: {
    _id: string;
    trackerId: string;
    topicId: string;
    parentSubtopicId: string | null;
    title: string;
    description: string;
    order: number;
    depth: number;
  };
  addedTopic?: {
    _id: string;
    trackerId: string;
    title: string;
    description: string;
    order: number;
  };
  placedUnder:
    | { type: 'subtopic'; _id: string; title: string }
    | { type: 'topic'; _id: string; title: string }
    | { type: 'tracker'; _id: string; title: 'Top Level' };
};

// ─── Lesson ───────────────────────────────────────────────────────────────────

export type GeneratedTrackerLessonRecord = {
  _id: ObjectIdLike;
  trackerId: ObjectIdLike;
  subtopicId: ObjectIdLike;
  userId: ObjectIdLike;
  title: string;
  summary: string;
  explanation: string;
  insight: string;
  lessonType: LessonType;
  compilerRuntime: 'javascript' | 'typescript' | 'python' | 'c++' | 'c' | 'java' | null;
  codeExample: { language: string; fileName: string; code: string };
  practiceTask: {
    title: string;
    description: string;
    starterCode?: string;
    expectedOutput?: string;
    expectedAnswer?: string;
  };
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
};

export type RunLessonCodeInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  sourceCode: string;
  languageId: number;
  stdin?: string;
};

export type TrackerStatusFilter = 'all' | 'active' | 'stalled' | 'completed' | 'archived';

export type TrackerDomainFilter =
  | 'all'
  | 'engineering'
  | 'frontend'
  | 'backend'
  | 'algorithms'
  | 'architecture'
  | 'development'
  | 'design'
  | 'ai'
  | 'other';

export type TrackerSummaryResult = TrackerSummaryRecord;
