import type { SubscriptionsUseCases } from './application/subscriptions-use-cases.contract';
import { SubscriptionsMapper } from './application/subscriptions.mapper';
import { CreateSubscriptionOrderUseCase } from './application/use-cases/create-subscription-order.usecase';
import { GetCurrentSubscriptionUseCase } from './application/use-cases/get-current-subscription.usecase';
import { ListSubscriptionPlansUseCase } from './application/use-cases/list-subscription-plans.usecase';
import { VerifySubscriptionPaymentUseCase } from './application/use-cases/verify-subscription-payment.usecase';
import { mongoSubscriptionRepository } from './infrastructure/repositories/mongo-subscription.repository';
import { razorpaySubscriptionPaymentGateway } from './infrastructure/providers/razorpay-subscription-payment.gateway';
import { SubscriptionLimitService } from './infrastructure/services/subscription-limit.service';
import { createPlanLimitMiddleware } from './presentation/plan-limit.middleware';

export type SubscriptionsComposition = { useCases: SubscriptionsUseCases };

export const subscriptionLimitService = new SubscriptionLimitService();
export const enforcePlanLimit = createPlanLimitMiddleware(subscriptionLimitService);

export const createSubscriptionsComposition = (): SubscriptionsComposition => {
  const mapper = new SubscriptionsMapper();

  return {
    useCases: {
      listPlans: new ListSubscriptionPlansUseCase(mongoSubscriptionRepository, mapper),
      getCurrent: new GetCurrentSubscriptionUseCase(mongoSubscriptionRepository, mapper),
      createOrder: new CreateSubscriptionOrderUseCase(
        mongoSubscriptionRepository,
        razorpaySubscriptionPaymentGateway,
        mapper
      ),
      verifyPayment: new VerifySubscriptionPaymentUseCase(
        mongoSubscriptionRepository,
        razorpaySubscriptionPaymentGateway,
        mapper
      ),
    },
  };
};
