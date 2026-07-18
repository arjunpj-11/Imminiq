import type {
  PaidSubscriptionPlanId,
  SubscriptionBillingCycle,
} from '../../domain/entities/subscription.entity';
import type { ISubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';
import type { ISubscriptionPaymentGateway } from '../../domain/services/subscription-payment-gateway.interface';
import { SubscriptionsApplicationError } from '../subscriptions-application.error';
import type { SubscriptionOrderDTO } from '../subscriptions.dto';
import type { ISubscriptionsMapper } from '../subscriptions.mapper';
import type { IClock } from '../../../../../shared/time/clock.interface';

export interface ICreateSubscriptionOrderUseCase {
  execute(
    userId: string,
    planId: PaidSubscriptionPlanId,
    billingCycle: SubscriptionBillingCycle
  ): Promise<SubscriptionOrderDTO>;
}

export class CreateSubscriptionOrderUseCase implements ICreateSubscriptionOrderUseCase {
  constructor(
    private readonly repository: Pick<ISubscriptionRepository, 'createPending' | 'getPlan'>,
    private readonly paymentGateway: ISubscriptionPaymentGateway,
    private readonly mapper: ISubscriptionsMapper,
    private readonly clock: IClock
  ) {}

  async execute(
    userId: string,
    planId: PaidSubscriptionPlanId,
    billingCycle: SubscriptionBillingCycle
  ) {
    const plan = await this.repository.getPlan(planId);
    if (!plan || plan.id === 'free') throw SubscriptionsApplicationError.invalidPlan();
    const amount = billingCycle === 'annual' ? plan.annualAmount : plan.monthlyAmount;
    const receipt = `sub_${userId.slice(-8)}_${this.clock.now().getTime().toString(36)}`.slice(
      0,
      40
    );
    const order = await this.paymentGateway.createOrder(amount, receipt);
    await this.repository.createPending({
      userId,
      planId,
      planName: plan.name,
      billingCycle,
      amount,
      razorpayOrderId: order.id,
      limits: plan.limits,
    });
    return this.mapper.toOrderDTO({
      keyId: this.paymentGateway.getPublicKey(),
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: plan.name,
    });
  }
}
