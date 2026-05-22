export type TrackerStatus = 'active' | 'stalled' | 'completed' | 'archived'

export type TrackerVisibility = 'private' | 'public'

export type TrackerDomain =
  | 'engineering'
  | 'frontend'
  | 'backend'
  | 'algorithms'
  | 'architecture'
  | 'development'
  | 'design'
  | 'ai'
  | 'other'

export type TrackerLevel = 'beginner' | 'intermediate' | 'advanced'

export type TopicStatus = 'locked' | 'available' | 'in_progress' | 'completed'

export type SubtopicStatus = 'locked' | 'available' | 'in_progress' | 'completed'

export type TrackerSortBy = 'lastActive' | 'createdAt' | 'progress' | 'title'

export type ObjectIdLike = {
  toString(): string
}

export type TrackerListFilter = {
  userId: string
  status?: TrackerStatus | 'all'
  domain?: TrackerDomain | 'all'
  sortBy?: TrackerSortBy
  page: number
  limit: number
}

export type CreateTrackerInput = {
  userId: string
  title: string
  description?: string
  domain?: TrackerDomain
  goal?: string
  level?: TrackerLevel
  visibility?: TrackerVisibility
}

export type UpdateTrackerInput = {
  trackerId: string
  userId: string
  title?: string
  description?: string
  domain?: TrackerDomain
  goal?: string
  level?: TrackerLevel
}

export type CreateTrackerTopicInput = {
  trackerId: string
  title: string
  description: string
  order: number
}

export type CreateTopicUseCaseInput = {
  trackerId: string
  userId: string
  title: string
  description?: string
}

export type CreateTrackerSubtopicInput = {
  trackerId: string
  topicId: string
  parentSubtopicId: string | null
  title: string
  description: string
  order: number
  depth: number
  estimatedMinutes?: number
}

export type CreateSubtopicUseCaseInput = {
  trackerId: string
  topicId: string
  userId: string
  title: string
  description?: string
  parentSubtopicId?: string | null
  estimatedMinutes?: number
}

export type UpdateSubtopicProgressInput = {
  trackerId: string
  subtopicId: string
  userId: string
  status: 'in_progress' | 'completed'
  timeSpentMinutes?: number
}

export type AddMissingEvaluationTopicInput = {
  trackerId: string
  evaluationJobId: string
  topicIndex: string
  userId: string
}

export type MissingTopicSuggestion = {
  title: string
  description: string
  reason: string
  suggestedParentTitle: string
  isAdded?: boolean
  addedSubtopicId?: string
  addedTopicId?: string
  addedAt?: Date | string
}

export type EvaluationOutputData = {
  trackerId?: string
  sourceRoadmapJobId?: string
  evaluation?: {
    score?: number
    grade?: string
    summary?: string
    missingTopics?: MissingTopicSuggestion[]
  }
}

export interface TrackerRecord {
  _id: ObjectIdLike
  ownerId?: ObjectIdLike | string
  title?: string
  description?: string
  domain?: TrackerDomain | string
  goal?: string
  level?: TrackerLevel | string
  status?: TrackerStatus
  visibility?: TrackerVisibility
  progressPercent?: number
  topicsCount?: number
  subtopicsCount?: number
  completedSubtopicsCount?: number
  totalTimeSpentMinutes?: number
  publishedAt?: Date | null
  completedAt?: Date | null
  lastActiveAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
}

export interface EvaluationJobRecord {
  _id: ObjectIdLike
  status: string
  outputData?: unknown
}

export interface TrackerTopicRecord {
  _id: ObjectIdLike
  trackerId?: ObjectIdLike
  title: string
  description?: string
  order: number
  status?: TopicStatus
  progressPercent?: number
  estimatedHours?: number
}

export interface TrackerSubtopicRecord {
  _id: ObjectIdLike
  trackerId: ObjectIdLike
  topicId: ObjectIdLike
  parentSubtopicId?: ObjectIdLike | null
  title: string
  description: string
  order: number
  depth: number
  status?: SubtopicStatus
  isLocked?: boolean
  estimatedMinutes?: number
  timeSpentMinutes?: number
  progressPercent?: number
  completedAt?: Date | null
}

export type CreatedTrackerTopicRecord = {
  _id: ObjectIdLike
  trackerId: ObjectIdLike
  title: string
  description: string
  order: number
}

export type CreatedTrackerSubtopicRecord = TrackerSubtopicRecord

export interface LastTopicRecord {
  order?: number
}

export interface LastSiblingSubtopicRecord {
  order?: number
}

export type TrackerSummaryResult = {
  totalTrackers: number
  activeTrackers: number
  completedTrackers: number
  publishedTrackers: number
  averageProgress: number
}

export type TrackerListResult = {
  trackers: TrackerRecord[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type RoadmapSubtopicNode = {
  _id: string
  title: string
  description: string
  order: number
  depth: number
  status: SubtopicStatus
  isLocked: boolean
  estimatedMinutes: number
  progressPercent: number
  completedAt: Date | null
  children: RoadmapSubtopicNode[]
}

export type RoadmapTopicNode = {
  _id: string
  title: string
  description: string
  order: number
  status: TopicStatus
  progressPercent: number
  estimatedHours: number
  subtopics: RoadmapSubtopicNode[]
}

export type FlattenedLessonNode = RoadmapSubtopicNode & {
  topicId: string
  topicTitle: string
}

export interface AddMissingEvaluationTopicResult {
  trackerId: string
  evaluationJobId: string
  missingTopicIndex: number

  addedSubtopic?: {
    _id: string
    trackerId: string
    topicId: string
    parentSubtopicId: string | null
    title: string
    description: string
    order: number
    depth: number
  }

  addedTopic?: {
    _id: string
    trackerId: string
    title: string
    description: string
    order: number
  }

  placedUnder:
    | {
        type: 'subtopic'
        _id: string
        title: string
      }
    | {
        type: 'topic'
        _id: string
        title: string
      }
    | {
        type: 'tracker'
        _id: string
        title: 'Top Level'
      }
}

export type LessonType =
  | 'concept'
  | 'coding'
  | 'interview'
  | 'system_design'
  | 'theory'

export type GeneratedTrackerLessonRecord = {
  _id: {
    toString(): string
  }

  trackerId: {
    toString(): string
  }

  subtopicId: {
    toString(): string
  }

  userId: {
    toString(): string
  }

  title: string
  summary: string
  explanation: string
  insight: string
  lessonType: LessonType
  requiresCompiler: boolean

  codeExample: {
    language: string
    fileName: string
    code: string
  }

  practiceTask: {
    title: string
    description: string
    starterCode: string
  }

  tags: string[]

  difficulty: 'beginner' | 'intermediate' | 'advanced'

  estimatedMinutes: number
}

export type RunLessonCodeInput = {
  trackerId: string
  subtopicId: string
  userId: string
  sourceCode: string
  languageId: number
  stdin?: string
}

export type TrackerSummaryRecord = {
  totalTrackers: number
  activeTrackers: number
  completedTrackers: number
  publishedTrackers: number
  averageProgress: number
}

export type TrackerStatusFilter =
  | 'all'
  | 'active'
  | 'stalled'
  | 'completed'
  | 'archived'

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
  | 'other'

