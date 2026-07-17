import type { ErrorKind } from '../../../../shared/errors/error-kind';
export class SubscriptionsApplicationError extends Error {
  readonly kind: ErrorKind;
  readonly code: string;

  private constructor(kind: ErrorKind, code: string, message: string) {
    super(message);
    this.name = 'SubscriptionsApplicationError';
    this.kind = kind;
    this.code = code;
  }

  static invalidPlan() {
    return new SubscriptionsApplicationError(
      'invalid-input',
      'INVALID_SUBSCRIPTION_PLAN',
      'Select a paid subscription plan'
    );
  }

  static orderNotFound() {
    return new SubscriptionsApplicationError(
      'missing-resource',
      'SUBSCRIPTION_ORDER_NOT_FOUND',
      'Subscription order not found'
    );
  }

  static invalidPaymentSignature() {
    return new SubscriptionsApplicationError(
      'invalid-input',
      'PAYMENT_SIGNATURE_INVALID',
      'Payment verification failed'
    );
  }
}
