export type CreateTrackerTopicInput = {
  trackerId: string
  title: string
  description: string
  order: number
}

export type CreateTrackerSubtopicInput = {
  trackerId: string
  topicId: string
  parentSubtopicId: string | null
  title: string
  description: string
  order: number
  depth: number
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
  _id: {
    toString(): string
  }
}

export interface EvaluationJobRecord {
  _id: {
    toString(): string
  }
  status: string
  outputData?: unknown
}

export interface TrackerTopicRecord {
  _id: {
    toString(): string
  }
  trackerId?: {
    toString(): string
  }
  title: string
  description?: string
  order: number
}

export interface TrackerSubtopicRecord {
  _id: {
    toString(): string
  }
  trackerId: {
    toString(): string
  }
  topicId: {
    toString(): string
  }
  parentSubtopicId?: {
    toString(): string
  } | null
  title: string
  description: string
  order: number
  depth: number
}

export type CreatedTrackerTopicRecord = {
  _id: {
    toString(): string
  }
  trackerId: {
    toString(): string
  }
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
