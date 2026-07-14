import type { ICreateSubscriptionOrderUseCase } from './use-cases/create-subscription-order.usecase';
import type { IGetCurrentSubscriptionUseCase } from './use-cases/get-current-subscription.usecase';
import type { IListSubscriptionPlansUseCase } from './use-cases/list-subscription-plans.usecase';
import type { IVerifySubscriptionPaymentUseCase } from './use-cases/verify-subscription-payment.usecase';

export type SubscriptionsUseCases = {
  listPlans: IListSubscriptionPlansUseCase;
  getCurrent: IGetCurrentSubscriptionUseCase;
  createOrder: ICreateSubscriptionOrderUseCase;
  verifyPayment: IVerifySubscriptionPaymentUseCase;
};
