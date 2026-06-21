import { OnboardingDomainError } from '../../domain/errors/onboarding-domain.error'

export type OnboardingApplicationErrorCode =
  | 'AI_QUEUE_ERROR'
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
  | 'TRACKER_NOT_FOUND'

export class OnboardingApplicationError extends OnboardingDomainError {
  readonly statusCode: number

  private constructor(
    statusCode: number,
    code: OnboardingApplicationErrorCode,
    message: string,
  ) {
    super(code, message)
    this.name = 'OnboardingApplicationError'
    this.statusCode = statusCode
  }

  static aiQueueError(
    message = 'Failed to enqueue AI job',
  ): OnboardingApplicationError {
    return new OnboardingApplicationError(500, 'AI_QUEUE_ERROR', message)
  }

  static evaluationJobAlreadyActive(): OnboardingApplicationError {
    return new OnboardingApplicationError(
      409,
      'EVALUATION_JOB_ALREADY_ACTIVE',
      'A roadmap evaluation job is already running for this roadmap.',
    )
  }

  static evaluationResultMissing(): OnboardingApplicationError {
    return new OnboardingApplicationError(
      500,
      'EVALUATION_RESULT_MISSING',
      'Evaluation result is missing',
    )
  }

  static forbidden(): OnboardingApplicationError {
    return new OnboardingApplicationError(403, 'FORBIDDEN', 'Forbidden')
  }

  static invalidJobType(message: string): OnboardingApplicationError {
    return new OnboardingApplicationError(400, 'INVALID_JOB_TYPE', message)
  }

  static jobPending(message: string): OnboardingApplicationError {
    return new OnboardingApplicationError(400, 'JOB_PENDING', message)
  }

  static notFound(message: string): OnboardingApplicationError {
    return new OnboardingApplicationError(404, 'NOT_FOUND', message)
  }

  static roadmapEvaluationQuotaExceeded(): OnboardingApplicationError {
    return new OnboardingApplicationError(
      429,
      'ROADMAP_EVALUATION_QUOTA_EXCEEDED',
      'Roadmap evaluation limit reached. Please try again later.',
    )
  }

  static roadmapGenerationQuotaExceeded(): OnboardingApplicationError {
    return new OnboardingApplicationError(
      429,
      'ROADMAP_GENERATION_QUOTA_EXCEEDED',
      'Roadmap generation limit reached. Please try again later.',
    )
  }

  static roadmapJobAlreadyActive(): OnboardingApplicationError {
    return new OnboardingApplicationError(
      409,
      'ROADMAP_JOB_ALREADY_ACTIVE',
      'A roadmap generation job is already running for this account.',
    )
  }

  static serverError(message: string): OnboardingApplicationError {
    return new OnboardingApplicationError(500, 'SERVER_ERROR', message)
  }

  static trackerNotFound(message: string): OnboardingApplicationError {
    return new OnboardingApplicationError(404, 'TRACKER_NOT_FOUND', message)
  }
}

export const isOnboardingApplicationError = (
  error: unknown,
): error is OnboardingApplicationError =>
  error instanceof OnboardingApplicationError
