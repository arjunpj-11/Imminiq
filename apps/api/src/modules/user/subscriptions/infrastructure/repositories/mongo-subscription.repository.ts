import { Subscription } from '../../../../../infrastructure/database/models/subscription.model';
import { SubscriptionPlan as SubscriptionPlanModel } from '../../../../../infrastructure/database/models/subscription-plan.model';
import { User } from '../../../../../infrastructure/database/models/user.model';
import {
  getDefaultPlanLimits,
  type SubscriptionPlanId,
  type SubscriptionPlanLimits,
  type UserSubscription,
} from '../../domain/entities/subscription.entity';
import type { ISubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';

const mapSubscription = (row: {
  _id: unknown;
  planId: 'pro' | 'premium';
  planName: string;
  billingCycle: 'monthly' | 'annual';
  amount: number;
  currency: 'INR';
  status: string;
  startsAt?: Date | null;
  endsAt?: Date | null;
  createdAt: Date;
  limits?: SubscriptionPlanLimits;
}): UserSubscription => ({
  id: String(row._id),
  planId: row.planId,
  planName: row.planName,
  billingCycle: row.billingCycle,
  amount: row.amount,
  currency: row.currency,
  status: row.status,
  startsAt: row.startsAt ?? null,
  endsAt: row.endsAt ?? null,
  createdAt: row.createdAt,
  limits: { ...(row.limits ?? getDefaultPlanLimits(row.planId)) },
});

export class MongoSubscriptionRepository implements ISubscriptionRepository {
  async getPlanLimits(planId: SubscriptionPlanId) {
    const defaults = getDefaultPlanLimits(planId);
    const row = await SubscriptionPlanModel.findOne({
      $or: [{ planId }, { code: planId }],
    })
      .select('limits')
      .lean();
    return { ...(row?.limits ?? defaults) } as SubscriptionPlanLimits;
  }

  async createPending(input: Parameters<ISubscriptionRepository['createPending']>[0]) {
    return mapSubscription(await Subscription.create({ ...input, currency: 'INR', status: 'pending' }));
  }

  async findByOrderId(orderId: string) {
    const row = await Subscription.findOne({ razorpayOrderId: orderId }).lean();
    return row ? { ...mapSubscription(row), userId: String(row.userId) } : null;
  }

  async findCurrent(userId: string) {
    const row = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'canceled'] },
      endsAt: { $gt: new Date() },
    })
      .sort({ endsAt: -1 })
      .lean();
    return row ? mapSubscription(row) : null;
  }

  async activate(
    orderId: string,
    paymentId: string,
    signature: string,
    startsAt: Date,
    endsAt: Date
  ) {
    const pending = await Subscription.findOne({ razorpayOrderId: orderId }).lean();
    if (!pending) throw new Error('Subscription order disappeared during activation');
    await Subscription.updateMany(
      { userId: pending.userId, status: 'active', razorpayOrderId: { $ne: orderId } },
      { $set: { status: 'replaced' } }
    );
    const row = await Subscription.findOneAndUpdate(
      { razorpayOrderId: orderId },
      {
        $set: {
          status: 'active',
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          startsAt,
          endsAt,
        },
      },
      { new: true }
    ).lean();
    if (!row) throw new Error('Subscription activation failed');
    await User.updateOne({ _id: row.userId }, { $set: { isPremium: true } });
    return mapSubscription(row);
  }

  async expireEnded(userId: string, now: Date) {
    await Subscription.updateMany(
      { userId, status: { $in: ['active', 'canceled'] }, endsAt: { $lte: now } },
      { $set: { status: 'expired' } }
    );
    const active = await Subscription.exists({
      userId,
      status: { $in: ['active', 'canceled'] },
      endsAt: { $gt: now },
    });
    await User.updateOne({ _id: userId }, { $set: { isPremium: Boolean(active) } });
  }
}

export const mongoSubscriptionRepository = new MongoSubscriptionRepository();
