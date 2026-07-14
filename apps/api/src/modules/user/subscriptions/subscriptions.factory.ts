import { SubscriptionsUseCase } from './application/subscriptions.usecase';
import { mongoSubscriptionRepository } from './infrastructure/mongo-subscription.repository';
import { razorpaySubscriptionPaymentGateway } from './infrastructure/razorpay-subscription-payment.gateway';

export const createSubscriptionsComposition = () => ({
  useCase: new SubscriptionsUseCase(
    mongoSubscriptionRepository,
    razorpaySubscriptionPaymentGateway
  ),
});
