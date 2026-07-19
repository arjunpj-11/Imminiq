export type AdaptiveLearningDomainErrorCode =
  | 'ADAPTIVE_ASSESSMENT_GENERATION_ACTIVE'
  | 'ADAPTIVE_TRACKER_REQUIRED'
  | 'INVALID_ADVISOR_QUESTION';

export class AdaptiveLearningDomainError extends Error {
  constructor(
    readonly code: AdaptiveLearningDomainErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'AdaptiveLearningDomainError';
  }
}
