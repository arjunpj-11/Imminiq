import type {
  PaymentVerificationInput,
  UserSubscription,
} from '../../domain/entities/subscription.entity';
import type { ISubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';
import type { ISubscriptionPaymentGateway } from '../../domain/services/subscription-payment-gateway.interface';
import { SubscriptionsApplicationError } from '../subscriptions-application.error';

export interface IVerifySubscriptionPaymentUseCase {
  execute(input: PaymentVerificationInput): Promise<UserSubscription>;
}

export class VerifySubscriptionPaymentUseCase implements IVerifySubscriptionPaymentUseCase {
  constructor(
    private readonly repository: ISubscriptionRepository,
    private readonly paymentGateway: ISubscriptionPaymentGateway
  ) {}

  async execute(input: PaymentVerificationInput) {
    const subscription = await this.repository.findByOrderId(input.razorpayOrderId);
    if (!subscription || subscription.userId !== input.userId) {
      throw SubscriptionsApplicationError.orderNotFound();
    }
    if (subscription.status === 'active') return subscription;
    if (
      !this.paymentGateway.verifySignature(
        input.razorpayOrderId,
        input.razorpayPaymentId,
        input.razorpaySignature
      )
    ) {
      throw SubscriptionsApplicationError.invalidPaymentSignature();
    }
    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    if (subscription.billingCycle === 'annual') endsAt.setFullYear(endsAt.getFullYear() + 1);
    else endsAt.setMonth(endsAt.getMonth() + 1);
    return this.repository.activate(
      input.razorpayOrderId,
      input.razorpayPaymentId,
      input.razorpaySignature,
      startsAt,
      endsAt
    );
  }
}
