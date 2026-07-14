import type {
  PendingSubscriptionInput,
  SubscriptionPlanId,
  SubscriptionPlan,
  UserSubscription,
} from '../entities/subscription.entity';

export interface ISubscriptionRepository {
  getPlans(): Promise<SubscriptionPlan[]>;
  getPlan(planId: SubscriptionPlanId): Promise<SubscriptionPlan>;
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
