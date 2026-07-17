import type { ErrorKind } from '../../../../shared/errors/error-kind';

export class SubscriptionLimitExceededError extends Error {
  readonly kind: ErrorKind = 'rate-limited';
  readonly code = 'SUBSCRIPTION_PLAN_LIMIT_EXCEEDED';

  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionLimitExceededError';
  }
}
