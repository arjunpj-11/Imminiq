import type { SubscriptionsUseCases } from './application/subscriptions-use-cases.contract';
import { CreateSubscriptionOrderUseCase } from './application/use-cases/create-subscription-order.usecase';
import { GetCurrentSubscriptionUseCase } from './application/use-cases/get-current-subscription.usecase';
import { ListSubscriptionPlansUseCase } from './application/use-cases/list-subscription-plans.usecase';
import { VerifySubscriptionPaymentUseCase } from './application/use-cases/verify-subscription-payment.usecase';
import { mongoSubscriptionRepository } from './infrastructure/repositories/mongo-subscription.repository';
import { razorpaySubscriptionPaymentGateway } from './infrastructure/providers/razorpay-subscription-payment.gateway';

export type SubscriptionsComposition = { useCases: SubscriptionsUseCases };

export const createSubscriptionsComposition = (): SubscriptionsComposition => ({
  useCases: {
    listPlans: new ListSubscriptionPlansUseCase(mongoSubscriptionRepository),
    getCurrent: new GetCurrentSubscriptionUseCase(mongoSubscriptionRepository),
    createOrder: new CreateSubscriptionOrderUseCase(
      mongoSubscriptionRepository,
      razorpaySubscriptionPaymentGateway
    ),
    verifyPayment: new VerifySubscriptionPaymentUseCase(
      mongoSubscriptionRepository,
      razorpaySubscriptionPaymentGateway
    ),
  },
});
