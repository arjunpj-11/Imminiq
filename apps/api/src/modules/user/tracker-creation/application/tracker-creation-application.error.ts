import type { ErrorKind } from '../../../../shared/errors/error-kind';
import { TrackerCreationDomainError } from '../domain/tracker-creation-domain.error';

export type TrackerCreationApplicationErrorCode =
  | 'AI_QUEUE_ERROR'
  | 'CLONE_FRESHNESS_ANALYSIS_ALREADY_USED'
  | 'EVALUATION_JOB_ALREADY_ACTIVE'
  | 'EVALUATION_RESULT_MISSING'
  | 'FORBIDDEN'
  | 'INVALID_JOB_TYPE'
  | 'JOB_PENDING'
  | 'NOT_FOUND'
  | 'ROADMAP_EVALUATION_QUOTA_EXCEEDED'
  | 'ROADMAP_GENERATION_QUOTA_EXCEEDED'
  | 'ROADMAP_JOB_ALREADY_ACTIVE'
  | 'SERVER_ERROR'
  | 'TRACKER_NOT_FOUND';

export class TrackerCreationApplicationError extends TrackerCreationDomainError {
  readonly kind: ErrorKind;

  private constructor(kind: ErrorKind, code: TrackerCreationApplicationErrorCode, message: string) {
    super(code, message);
    this.name = 'TrackerCreationApplicationError';
    this.kind = kind;
  }

  static aiQueueError(message = 'Failed to enqueue AI job'): TrackerCreationApplicationError {
    return new TrackerCreationApplicationError('internal', 'AI_QUEUE_ERROR', message);
  }

  static cloneFreshnessAnalysisAlreadyUsed(): TrackerCreationApplicationError {
    return new TrackerCreationApplicationError(
      'conflict',
      'CLONE_FRESHNESS_ANALYSIS_ALREADY_USED',
      'The one-time new-topic analysis has already been used for this cloned tracker.'
    );
  }

  static evaluationJobAlreadyActive(): TrackerCreationApplicationError {
    return new TrackerCreationApplicationError(
      'conflict',
      'EVALUATION_JOB_ALREADY_ACTIVE',
      'A roadmap evaluation job is already running for this roadmap.'
    );
  }

  static evaluationResultMissing(): TrackerCreationApplicationError {
    return new TrackerCreationApplicationError(
      'internal',
      'EVALUATION_RESULT_MISSING',
      'Evaluation result is missing'
    );
  }

  static forbidden(): TrackerCreationApplicationError {
    return new TrackerCreationApplicationError('forbidden', 'FORBIDDEN', 'Forbidden');
  }

  static invalidJobType(message: string): TrackerCreationApplicationError {
    return new TrackerCreationApplicationError('invalid-input', 'INVALID_JOB_TYPE', message);
  }

  static jobPending(message: string): TrackerCreationApplicationError {
    return new TrackerCreationApplicationError('invalid-input', 'JOB_PENDING', message);
  }

  static notFound(message: string): TrackerCreationApplicationError {
    return new TrackerCreationApplicationError('missing-resource', 'NOT_FOUND', message);
  }

  static roadmapEvaluationQuotaExceeded(): TrackerCreationApplicationError {
    return new TrackerCreationApplicationError(
      'rate-limited',
      'ROADMAP_EVALUATION_QUOTA_EXCEEDED',
      'Roadmap evaluation limit reached. Please try again later.'
    );
  }

  static roadmapGenerationQuotaExceeded(): TrackerCreationApplicationError {
    return new TrackerCreationApplicationError(
      'rate-limited',
      'ROADMAP_GENERATION_QUOTA_EXCEEDED',
      'Roadmap generation limit reached. Please try again later.'
    );
  }

  static roadmapJobAlreadyActive(): TrackerCreationApplicationError {
    return new TrackerCreationApplicationError(
      'conflict',
      'ROADMAP_JOB_ALREADY_ACTIVE',
      'A roadmap generation job is already running for this account.'
    );
  }

  static serverError(message: string): TrackerCreationApplicationError {
    return new TrackerCreationApplicationError('internal', 'SERVER_ERROR', message);
  }

  static trackerNotFound(message: string): TrackerCreationApplicationError {
    return new TrackerCreationApplicationError('missing-resource', 'TRACKER_NOT_FOUND', message);
  }
}

export const isTrackerCreationApplicationError = (error: unknown): error is TrackerCreationApplicationError =>
  error instanceof TrackerCreationApplicationError;
