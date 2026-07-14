import { Subscription } from '../../../../../infrastructure/database/models/subscription.model';
import { SubscriptionPlan as SubscriptionPlanModel } from '../../../../../infrastructure/database/models/subscription-plan.model';
import { User } from '../../../../../infrastructure/database/models/user.model';
import { createAdminPage, escapeAdminSearch, recordAdminAction } from '../../../shared/infrastructure';
import type { AdminActor } from '../../../shared/domain';
import {
  getDefaultSubscriptionPlan,
  type SubscriptionPlanId,
} from '../../../../user/subscriptions';
import type {
  AdminSubscriptionPlan,
  AdminPlanLimitField,
  AdminSubscriptionPlanInput,
  AdminSubscriptionItem,
  AdminSubscriptionOverview,
  AdminSubscriptionQuery,
} from '../../domain/entities/admin-subscription.entity';
import type { IAdminSubscriptionsRepository } from '../../domain/repositories/admin-subscriptions.repository.interface';

const successfulStatuses = ['active', 'canceled', 'expired', 'replaced'];
const findPlan = async (planId: SubscriptionPlanId) => {
  return SubscriptionPlanModel.findOne({
    $or: [{ planId }, { code: planId }],
  })
    .sort({ updatedAt: -1, _id: -1 })
    .lean();
};

export class MongoAdminSubscriptionsRepository implements IAdminSubscriptionsRepository {
  async getOverview(query: AdminSubscriptionQuery): Promise<AdminSubscriptionOverview> {
    const filter: Record<string, unknown> = {};
    if (query.status && query.status !== 'all') filter.status = query.status;
    if (query.search) {
      const users = await User.find({
        $or: [
          { fullName: new RegExp(escapeAdminSearch(query.search), 'i') },
          { username: new RegExp(escapeAdminSearch(query.search), 'i') },
          { email: new RegExp(escapeAdminSearch(query.search), 'i') },
        ],
      })
        .select('_id')
        .lean();
      filter.userId = { $in: users.map((user) => user._id) };
    }
    const now = new Date();
    const [rows, total, metrics, planBreakdown, revenueByMonth, activeUsers, planRows] = await Promise.all([
      Subscription.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .populate('userId', 'fullName username email')
        .lean(),
      Subscription.countDocuments(filter),
      Subscription.aggregate<{ _id: null; revenue: number; count: number }>([
        { $match: { status: { $in: successfulStatuses } } },
        { $group: { _id: null, revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Subscription.aggregate<{ _id: string; count: number; revenue: number }>([
        { $match: { status: { $in: successfulStatuses } } },
        { $group: { _id: '$planName', count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
        { $sort: { count: -1 } },
      ]),
      Subscription.aggregate<{
        _id: string;
        revenue: number;
        subscriptions: number;
      }>([
        { $match: { status: { $in: successfulStatuses } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            revenue: { $sum: '$amount' },
            subscriptions: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 24 },
      ]),
      Subscription.distinct('userId', {
        status: { $in: ['active', 'canceled'] },
        endsAt: { $gt: now },
      }),
      Promise.all(
        (['free', 'pro', 'premium'] as const).map((planId) =>
          findPlan(planId)
        )
      ),
    ]);
    const active = await Subscription.find({
      status: { $in: ['active', 'canceled'] },
      endsAt: { $gt: now },
    })
      .select('amount billingCycle')
      .lean();
    const monthlyRecurringRevenue = active.reduce(
      (sum, item) => sum + (item.billingCycle === 'annual' ? item.amount / 12 : item.amount),
      0
    );
    const items: AdminSubscriptionItem[] = rows.map((row) => {
      const user = row.userId as unknown as {
        _id?: unknown;
        fullName?: string;
        username?: string;
        email?: string;
      };
      return {
        id: String(row._id),
        userId: String(user?._id ?? ''),
        userName: user?.fullName ?? user?.username ?? 'Unknown user',
        userEmail: user?.email ?? '',
        planName: row.planName,
        billingCycle: row.billingCycle,
        amount: row.amount,
        currency: row.currency,
        status: row.status,
        paymentId: row.razorpayPaymentId ?? null,
        startsAt: row.startsAt ?? null,
        endsAt: row.endsAt ?? null,
        purchasedAt: row.createdAt,
      };
    });
    return {
      metrics: {
        totalRevenue: metrics[0]?.revenue ?? 0,
        subscriptionsBought: metrics[0]?.count ?? 0,
        activePremiumSubscriptions: activeUsers.length,
        monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue),
      },
      planBreakdown: planBreakdown.map((item) => ({
        plan: item._id,
        count: item.count,
        revenue: item.revenue,
      })),
      revenueByMonth: revenueByMonth
        .map((item) => ({
          month: item._id,
          revenue: item.revenue,
          subscriptions: item.subscriptions,
        }))
        .reverse(),
      subscriptions: createAdminPage(items, query, total),
      plans: planRows.map((row, index) => {
        const planId = (['free', 'pro', 'premium'] as const)[index];
        const fallback = getDefaultSubscriptionPlan(planId);
        return {
          planId,
          name: row?.name ?? fallback.name,
          description: row?.description ?? fallback.description,
          monthlyAmount: row?.monthlyAmount ?? fallback.monthlyAmount,
          annualAmount: row?.annualAmount ?? fallback.annualAmount,
          currency: 'INR',
          features: row?.features?.length ? [...row.features] : [...fallback.features],
          highlighted: row?.highlighted ?? fallback.highlighted,
          limits: { ...(row?.limits ?? fallback.limits) },
          updatedAt: row?.updatedAt ?? null,
        };
      }) as AdminSubscriptionPlan[],
    };
  }

  async updatePlan(
    planId: AdminSubscriptionPlan['planId'],
    input: AdminSubscriptionPlanInput,
    propagateLimitFields: AdminPlanLimitField[],
    actor: AdminActor
  ): Promise<AdminSubscriptionPlan> {
    const existing = await findPlan(planId);
    const filter = existing?._id ? { _id: existing._id } : { planId };
    const fallback = getDefaultSubscriptionPlan(planId as SubscriptionPlanId);
    if (existing?._id) {
      await SubscriptionPlanModel.deleteMany({
        _id: { $ne: existing._id },
        $or: [{ planId }, { code: planId }],
      });
    }
    const updated = await SubscriptionPlanModel.findOneAndUpdate(
      filter,
      {
        $set: { code: planId, planId, ...input, updatedBy: actor.userId },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).lean();
    const eligibleFields = planId === 'free'
      ? []
      : [...new Set(propagateLimitFields)];
    const activeFilter = {
      planId,
      status: { $in: ['active', 'canceled'] },
      endsAt: { $gt: new Date() },
    };
    for (const field of eligibleFields) {
      const next = input.limits[field];
      await Subscription.updateMany(
        {
          ...activeFilter,
          [`limits.${field}`]: next === 0
            ? { $ne: 0 }
            : { $ne: 0, $lt: next },
        },
        { $set: { [`limits.${field}`]: next } }
      );
    }
    await recordAdminAction(actor, 'subscription_plan_updated', 'admin.subscriptions', {
      planId,
      previous: existing ?? fallback,
      current: input,
      propagatedUpgradeFields: eligibleFields,
    });
    return {
      planId,
      name: updated?.name ?? input.name,
      description: updated?.description ?? input.description,
      monthlyAmount: updated?.monthlyAmount ?? input.monthlyAmount,
      annualAmount: updated?.annualAmount ?? input.annualAmount,
      currency: 'INR',
      features: [...(updated?.features ?? input.features)],
      highlighted: updated?.highlighted ?? input.highlighted,
      limits: { ...(updated?.limits ?? input.limits) },
      updatedAt: updated?.updatedAt ?? new Date(),
    };
  }

}

export const mongoAdminSubscriptionsRepository = new MongoAdminSubscriptionsRepository();
