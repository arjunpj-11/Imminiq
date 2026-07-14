import { ApiError } from '../../../../shared/utils/ApiError';
import type {
  PaidSubscriptionPlanId,
  PaymentVerificationInput,
  SubscriptionBillingCycle,
  SubscriptionPlan,
  UserSubscription,
} from '../domain/subscription.entity';
import { SUBSCRIPTION_PLANS } from '../domain/subscription.entity';
import type { ISubscriptionRepository } from '../domain/repositories/subscription.repository.interface';
import type { ISubscriptionPaymentGateway } from '../domain/services/subscription-payment-gateway.interface';

export type SubscriptionOrderResult = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  planName: string;
};

export interface ISubscriptionsUseCase {
  listPlans(): Promise<SubscriptionPlan[]>;
  getMine(userId: string): Promise<UserSubscription | null>;
  createOrder(
    userId: string,
    planId: PaidSubscriptionPlanId,
    billingCycle: SubscriptionBillingCycle
  ): Promise<SubscriptionOrderResult>;
  verifyPayment(input: PaymentVerificationInput): Promise<UserSubscription>;
}

export class SubscriptionsUseCase implements ISubscriptionsUseCase {
  constructor(
    private readonly repository: ISubscriptionRepository,
    private readonly paymentGateway: ISubscriptionPaymentGateway
  ) {}

  async listPlans() {
    return Promise.all(
      SUBSCRIPTION_PLANS.map(async (plan) => ({
        ...plan,
        features: [...plan.features],
        limits: await this.repository.getPlanLimits(plan.id),
      }))
    );
  }

  async getMine(userId: string) {
    await this.repository.expireEnded(userId, new Date());
    return this.repository.findCurrent(userId);
  }

  async createOrder(
    userId: string,
    planId: PaidSubscriptionPlanId,
    billingCycle: SubscriptionBillingCycle
  ) {
    const plan = SUBSCRIPTION_PLANS.find((candidate) => candidate.id === planId);
    if (!plan || plan.id === 'free') {
      throw new ApiError(400, 'Select a paid subscription plan', 'INVALID_SUBSCRIPTION_PLAN');
    }
    const amount = billingCycle === 'annual' ? plan.annualAmount : plan.monthlyAmount;
    const limits = await this.repository.getPlanLimits(planId);
    const receipt = `sub_${userId.slice(-8)}_${Date.now().toString(36)}`.slice(0, 40);
    const order = await this.paymentGateway.createOrder(amount, receipt);
    await this.repository.createPending({
      userId,
      planId,
      planName: plan.name,
      billingCycle,
      amount,
      razorpayOrderId: order.id,
      limits,
    });
    return {
      keyId: this.paymentGateway.getPublicKey(),
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: plan.name,
    };
  }

  async verifyPayment(input: PaymentVerificationInput) {
    const subscription = await this.repository.findByOrderId(input.razorpayOrderId);
    if (!subscription || subscription.userId !== input.userId) {
      throw new ApiError(404, 'Subscription order not found', 'SUBSCRIPTION_ORDER_NOT_FOUND');
    }
    if (subscription.status === 'active') return subscription;
    if (
      !this.paymentGateway.verifySignature(
        input.razorpayOrderId,
        input.razorpayPaymentId,
        input.razorpaySignature
      )
    ) {
      throw new ApiError(400, 'Payment verification failed', 'PAYMENT_SIGNATURE_INVALID');
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
