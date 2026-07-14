export class SubscriptionsApplicationError extends Error {
  readonly statusCode: number;
  readonly code: string;

  private constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'SubscriptionsApplicationError';
    this.statusCode = statusCode;
    this.code = code;
  }

  static invalidPlan() {
    return new SubscriptionsApplicationError(
      400,
      'INVALID_SUBSCRIPTION_PLAN',
      'Select a paid subscription plan'
    );
  }

  static orderNotFound() {
    return new SubscriptionsApplicationError(
      404,
      'SUBSCRIPTION_ORDER_NOT_FOUND',
      'Subscription order not found'
    );
  }

  static invalidPaymentSignature() {
    return new SubscriptionsApplicationError(
      400,
      'PAYMENT_SIGNATURE_INVALID',
      'Payment verification failed'
    );
  }
}
