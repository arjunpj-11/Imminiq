export class SubscriptionLimitExceededError extends Error {
  readonly statusCode = 429;
  readonly code = 'SUBSCRIPTION_PLAN_LIMIT_EXCEEDED';

  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionLimitExceededError';
  }
}
