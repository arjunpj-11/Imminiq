import type {
  PendingSubscriptionInput,
  SubscriptionPlanId,
  SubscriptionPlanLimits,
  UserSubscription,
} from '../entities/subscription.entity';

export interface ISubscriptionRepository {
  getPlanLimits(planId: SubscriptionPlanId): Promise<SubscriptionPlanLimits>;
  createPending(input: PendingSubscriptionInput): Promise<UserSubscription>;
  findByOrderId(orderId: string): Promise<(UserSubscription & { userId: string }) | null>;
  findCurrent(userId: string): Promise<UserSubscription | null>;
  activate(
    orderId: string,
    paymentId: string,
    signature: string,
    startsAt: Date,
    endsAt: Date
  ): Promise<UserSubscription>;
  expireEnded(userId: string, now: Date): Promise<void>;
}
