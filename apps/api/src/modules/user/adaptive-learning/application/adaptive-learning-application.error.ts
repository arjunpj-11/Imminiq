import type { ErrorKind } from '../../../../shared/errors/error-kind';
import { AdaptiveLearningDomainError } from '../domain/adaptive-learning-domain.error';

export class AdaptiveLearningApplicationError extends AdaptiveLearningDomainError {
  readonly kind: ErrorKind;

  private constructor(
    kind: ErrorKind,
    code: 'ADAPTIVE_TRACKER_REQUIRED' | 'INVALID_ADVISOR_QUESTION',
    message: string
  ) {
    super(code, message);
    this.kind = kind;
    this.name = 'AdaptiveLearningApplicationError';
  }

  static trackerRequired(): AdaptiveLearningApplicationError {
    return new AdaptiveLearningApplicationError(
      'conflict',
      'ADAPTIVE_TRACKER_REQUIRED',
      'Create and study at least one tracker before requesting an adaptive exam'
    );
  }

  static invalidAdvisorQuestion(): AdaptiveLearningApplicationError {
    return new AdaptiveLearningApplicationError(
      'invalid-input',
      'INVALID_ADVISOR_QUESTION',
      'Ask a complete question'
    );
  }
}
