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
import { systemClock } from '../../../infrastructure/time/system-clock';
import type { ISubscriptionLimitEnforcer } from './application/subscription-limit.contract';
import type { PlanLimitMiddleware } from './presentation/plan-limit.middleware';
import { getDefaultSubscriptionPlan } from './domain/entities/subscription.entity';

export type SubscriptionsComposition = {
  useCases: SubscriptionsUseCases;
  helpers: {
    limitEnforcer: ISubscriptionLimitEnforcer;
    enforcePlanLimit: PlanLimitMiddleware;
    getDefaultSubscriptionPlan: typeof getDefaultSubscriptionPlan;
  };
};

export const createSubscriptionsComposition = (): SubscriptionsComposition => {
  const mapper = new SubscriptionsMapper();
  const limitEnforcer = new SubscriptionLimitService();

  return {
    useCases: {
      listPlans: new ListSubscriptionPlansUseCase(mongoSubscriptionRepository, mapper),
      getCurrent: new GetCurrentSubscriptionUseCase(
        mongoSubscriptionRepository,
        mapper,
        systemClock
      ),
      createOrder: new CreateSubscriptionOrderUseCase(
        mongoSubscriptionRepository,
        razorpaySubscriptionPaymentGateway,
        mapper,
        systemClock
      ),
      verifyPayment: new VerifySubscriptionPaymentUseCase(
        mongoSubscriptionRepository,
        razorpaySubscriptionPaymentGateway,
        mapper,
        systemClock
      ),
    },
    helpers: {
      limitEnforcer,
      enforcePlanLimit: createPlanLimitMiddleware(limitEnforcer),
      getDefaultSubscriptionPlan,
    },
  };
};
