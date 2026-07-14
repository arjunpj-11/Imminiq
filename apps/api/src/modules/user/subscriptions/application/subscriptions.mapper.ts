import type {
  SubscriptionPlan,
  SubscriptionPlanLimits,
  UserSubscription,
} from '../domain/entities/subscription.entity';
import type {
  SubscriptionOrderDTO,
  SubscriptionPlanDTO,
  SubscriptionPlanLimitsDTO,
  UserSubscriptionDTO,
} from './subscriptions.dto';

export interface ISubscriptionsMapper {
  toPlanDTO(plan: SubscriptionPlan): SubscriptionPlanDTO;
  toUserSubscriptionDTO(subscription: UserSubscription): UserSubscriptionDTO;
  toOrderDTO(order: SubscriptionOrderDTO): SubscriptionOrderDTO;
}

const toLimitsDTO = (limits: SubscriptionPlanLimits): SubscriptionPlanLimitsDTO => ({
  ...limits,
});

export class SubscriptionsMapper implements ISubscriptionsMapper {
  toPlanDTO(plan: SubscriptionPlan): SubscriptionPlanDTO {
    return {
      ...plan,
      features: [...plan.features],
      limits: toLimitsDTO(plan.limits),
    };
  }

  toUserSubscriptionDTO(subscription: UserSubscription): UserSubscriptionDTO {
    return {
      ...subscription,
      startsAt: subscription.startsAt?.toISOString() ?? null,
      endsAt: subscription.endsAt?.toISOString() ?? null,
      createdAt: subscription.createdAt.toISOString(),
      limits: toLimitsDTO(subscription.limits),
    };
  }

  toOrderDTO(order: SubscriptionOrderDTO): SubscriptionOrderDTO {
    return { ...order };
  }
}
