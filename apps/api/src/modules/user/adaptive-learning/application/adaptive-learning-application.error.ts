import { AdaptiveLearningDomainError } from '../domain/adaptive-learning-domain.error';

export class AdaptiveLearningApplicationError extends AdaptiveLearningDomainError {
  readonly statusCode: number;

  private constructor(
    statusCode: number,
    code: 'ADAPTIVE_TRACKER_REQUIRED' | 'INVALID_ADVISOR_QUESTION',
    message: string
  ) {
    super(code, message);
    this.statusCode = statusCode;
    this.name = 'AdaptiveLearningApplicationError';
  }

  static trackerRequired(): AdaptiveLearningApplicationError {
    return new AdaptiveLearningApplicationError(
      409,
      'ADAPTIVE_TRACKER_REQUIRED',
      'Create and study at least one tracker before requesting an adaptive exam'
    );
  }

  static invalidAdvisorQuestion(): AdaptiveLearningApplicationError {
    return new AdaptiveLearningApplicationError(
      400,
      'INVALID_ADVISOR_QUESTION',
      'Ask a complete question'
    );
  }
}
