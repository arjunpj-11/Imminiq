import { TrackerDomainError } from '../domain/tracker-domain.error';

export type TrackerApplicationErrorCode =
  | 'EVALUATION_JOB_NOT_FOUND'
  | 'EVALUATION_JOB_PENDING'
  | 'INVALID_TOPIC_INDEX'
  | 'LESSON_NODE_NOT_FOUND'
  | 'LESSON_NOT_GENERATED'
  | 'MISSING_TOPIC_ALREADY_ADDED'
  | 'MISSING_TOPIC_NOT_FOUND'
  | 'MISSING_TOPICS_NOT_FOUND'
  | 'PARENT_SUBTOPIC_NOT_FOUND'
  | 'PARENT_TOPIC_MISMATCH'
  | 'SOLUTION_EMPTY'
  | 'SOLUTION_NOT_GENERATED'
  | 'SUBTOPIC_NOT_FOUND'
  | 'SUGGESTED_PARENT_NOT_FOUND'
  | 'TOPIC_NOT_FOUND'
  | 'TRACKER_EVALUATION_MISMATCH'
  | 'CLONED_TRACKER_CANNOT_BE_PUBLISHED'
  | 'TOPIC_CONTRIBUTION_ALREADY_EXISTS'
  | 'TOPIC_CONTRIBUTION_ALREADY_REVIEWED'
  | 'TOPIC_CONTRIBUTION_NOT_FOUND'
  | 'TOPIC_CONTRIBUTION_NOT_A_CHANGE'
  | 'TOPIC_CONTRIBUTION_REQUIRES_CLONE'
  | 'TOPIC_CONTRIBUTION_SOURCE_UNAVAILABLE'
  | 'FORBIDDEN'
  | 'TRACKER_NOT_FOUND';

export class TrackerApplicationError extends TrackerDomainError {
  readonly statusCode: number;

  private constructor(statusCode: number, code: TrackerApplicationErrorCode, message: string) {
    super(code, message);
    this.statusCode = statusCode;
    this.name = 'TrackerApplicationError';
  }

  static trackerNotFound(message = 'Tracker not found'): TrackerApplicationError {
    return new TrackerApplicationError(404, 'TRACKER_NOT_FOUND', message);
  }

  static forbidden(message = 'Forbidden'): TrackerApplicationError {
    return new TrackerApplicationError(403, 'FORBIDDEN', message);
  }

  static clonedTrackerCannotBePublished(): TrackerApplicationError {
    return new TrackerApplicationError(
      409,
      'CLONED_TRACKER_CANNOT_BE_PUBLISHED',
      'Cloned trackers cannot be published. Contribute improvements to the original tracker instead.'
    );
  }

  static contributionRequiresClone(): TrackerApplicationError {
    return new TrackerApplicationError(
      400,
      'TOPIC_CONTRIBUTION_REQUIRES_CLONE',
      'Topic contributions can only be sent from a cloned tracker.'
    );
  }

  static contributionSourceUnavailable(): TrackerApplicationError {
    return new TrackerApplicationError(
      409,
      'TOPIC_CONTRIBUTION_SOURCE_UNAVAILABLE',
      'The original tracker is no longer available for contributions.'
    );
  }

  static contributionAlreadyExists(): TrackerApplicationError {
    return new TrackerApplicationError(
      409,
      'TOPIC_CONTRIBUTION_ALREADY_EXISTS',
      'This topic already has an open or approved contribution request.'
    );
  }

  static contributionNotAChange(): TrackerApplicationError {
    return new TrackerApplicationError(
      409,
      'TOPIC_CONTRIBUTION_NOT_A_CHANGE',
      'Only topics added after cloning can be proposed to the original tracker.'
    );
  }

  static contributionNotFound(): TrackerApplicationError {
    return new TrackerApplicationError(
      404,
      'TOPIC_CONTRIBUTION_NOT_FOUND',
      'Topic contribution request not found.'
    );
  }

  static contributionAlreadyReviewed(): TrackerApplicationError {
    return new TrackerApplicationError(
      409,
      'TOPIC_CONTRIBUTION_ALREADY_REVIEWED',
      'This topic contribution has already been reviewed.'
    );
  }

  static lessonNotGenerated(
    message = 'Generate the lesson before continuing'
  ): TrackerApplicationError {
    return new TrackerApplicationError(404, 'LESSON_NOT_GENERATED', message);
  }

  static solutionNotGenerated(
    message = 'Generate the solution before asking doubts'
  ): TrackerApplicationError {
    return new TrackerApplicationError(404, 'SOLUTION_NOT_GENERATED', message);
  }

  static solutionEmpty(message = 'Saved solution is empty'): TrackerApplicationError {
    return new TrackerApplicationError(409, 'SOLUTION_EMPTY', message);
  }

  static subtopicNotFound(message = 'Subtopic not found'): TrackerApplicationError {
    return new TrackerApplicationError(404, 'SUBTOPIC_NOT_FOUND', message);
  }

  static topicNotFound(message = 'Topic not found'): TrackerApplicationError {
    return new TrackerApplicationError(404, 'TOPIC_NOT_FOUND', message);
  }

  static parentSubtopicNotFound(message = 'Parent subtopic not found'): TrackerApplicationError {
    return new TrackerApplicationError(404, 'PARENT_SUBTOPIC_NOT_FOUND', message);
  }

  static parentTopicMismatch(
    message = 'Parent subtopic does not belong to this topic'
  ): TrackerApplicationError {
    return new TrackerApplicationError(400, 'PARENT_TOPIC_MISMATCH', message);
  }

  static lessonNodeNotFound(message = 'Lesson node not found'): TrackerApplicationError {
    return new TrackerApplicationError(404, 'LESSON_NODE_NOT_FOUND', message);
  }

  static invalidTopicIndex(message = 'Invalid missing topic index'): TrackerApplicationError {
    return new TrackerApplicationError(400, 'INVALID_TOPIC_INDEX', message);
  }

  static evaluationJobNotFound(message = 'Evaluation job not found'): TrackerApplicationError {
    return new TrackerApplicationError(404, 'EVALUATION_JOB_NOT_FOUND', message);
  }

  static evaluationJobPending(
    message = 'Evaluation job is not completed yet'
  ): TrackerApplicationError {
    return new TrackerApplicationError(400, 'EVALUATION_JOB_PENDING', message);
  }

  static trackerEvaluationMismatch(
    message = 'Evaluation result does not belong to this tracker'
  ): TrackerApplicationError {
    return new TrackerApplicationError(400, 'TRACKER_EVALUATION_MISMATCH', message);
  }

  static missingTopicsNotFound(
    message = 'Missing topic suggestions not found'
  ): TrackerApplicationError {
    return new TrackerApplicationError(404, 'MISSING_TOPICS_NOT_FOUND', message);
  }

  static missingTopicNotFound(
    message = 'Missing topic suggestion not found'
  ): TrackerApplicationError {
    return new TrackerApplicationError(404, 'MISSING_TOPIC_NOT_FOUND', message);
  }

  static missingTopicAlreadyAdded(
    message = 'This missing topic has already been added'
  ): TrackerApplicationError {
    return new TrackerApplicationError(409, 'MISSING_TOPIC_ALREADY_ADDED', message);
  }

  static suggestedParentNotFound(message: string): TrackerApplicationError {
    return new TrackerApplicationError(404, 'SUGGESTED_PARENT_NOT_FOUND', message);
  }
}

export const isTrackerApplicationError = (error: unknown): error is TrackerApplicationError =>
  error instanceof TrackerApplicationError;
